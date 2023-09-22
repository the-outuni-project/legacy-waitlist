use crate::core::esi::{self, ESIScope};
use crate::data::character;
use crate::{config::Config, util::madness::Madness};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

use super::sse;

#[derive(Deserialize)]
struct CharacterResponse {
    name: String,
}

pub struct FleetUpdater {
    esi_client: esi::ESIClient,
    sse_client: sse::SSEClient,
    db: Arc<crate::DB>,
    config: Config,
}

impl FleetUpdater {
    pub fn new(db: Arc<crate::DB>, config: Config) -> FleetUpdater {
        FleetUpdater {
            esi_client: esi::ESIClient::new(
                db.clone(),
                config.esi.client_id.clone(),
                config.esi.client_secret.clone(),
            ),
            sse_client: sse::SSEClient::new(
                config.sse.url.clone(),
                &hex::decode(&config.sse.secret).unwrap(),
            ),
            db,
            config,
        }
    }

    pub fn start(self) {
        tokio::spawn(async move {
            self.run().await;
        });
    }

    async fn run(self) {
        loop {
            let sleep_time = match self.run_once().await {
                Ok(()) => 6,
                Err(e) => {
                    error!("Error in fleet updater: {:#?}", e);
                    30
                }
            };

            tokio::time::sleep(tokio::time::Duration::from_secs(sleep_time)).await;
        }
    }

    fn get_db(&self) -> &crate::DB {
        &self.db
    }

    async fn run_once(&self) -> Result<(), Madness> {
        // Get the fleets to update ONLY WHERE they have errored less than 10 times
        let fleets = sqlx::query!("SELECT id FROM fleet WHERE error_count < 10")
            .fetch_all(self.get_db())
            .await?;

        for fleet in fleets {
            self.update_fleet(fleet.id).await?;
        }

        Ok(())
    }

    async fn update_fleet(&self, fleet_id: i64) -> Result<(), Madness> {
        let fleet = sqlx::query!(
            "SELECT id, boss_id, boss_system_id, error_count FROM fleet WHERE id=?",
                fleet_id
        )
        .fetch_one(self.get_db())
        .await?;

        let members = match esi::fleet_members::get(&self.esi_client, fleet_id, fleet.boss_id).await {
            Ok(m) => m,
            Err(
                | esi::ESIError::NoToken
                | esi::ESIError::MissingScope
                | esi::ESIError::WithMessage(403, _)
            ) => {
                // The FC does not have permission to access this fleet. Set error_count = 10 so we stop updating this fleet
                sqlx::query!(
                    "UPDATE fleet SET error_count=? WHERE id=?",
                    10,
                    fleet_id
                )
                .execute(self.get_db())
                .await?;

                warn!("Access denied for fleet {}. Fleet {} will no longer be updated.", fleet_id, fleet_id);

                return Ok(());
            }
            Err(
                esi::ESIError::WithMessage(404, _)
            ) => {
                // Fleet no longer exists we need to remove it from the database
                warn!("Fleet {} no longer exists. Removing it from the database.", fleet_id);

                let now = chrono::Utc::now().timestamp();
                let mut tx = self.get_db().begin().await?;

                sqlx::query!("DELETE FROM fleet_squad WHERE fleet_id=?", fleet_id)
                    .execute(&mut tx)
                    .await?;

                sqlx::query!("DELETE FROM fleet WHERE id=?", fleet_id)
                    .execute(&mut tx)
                    .await?;

                sqlx::query!("UPDATE fleet_activity SET last_seen=?,has_left=true WHERE fleet_id=? AND has_left=false", now, fleet_id)
                    .execute(&mut tx)
                    .await?;

                tx.commit().await?;

                //todo: SSE update fleets

                return Ok(());
            }
            Err(e) => {
                warn!("Fleet {} error counter {}", fleet_id, fleet.error_count + 1);

                sqlx::query!("UPDATE fleet SET error_count=? WHERE id=?", fleet.error_count + 1, fleet_id)
                    .execute(self.get_db())
                    .await?;

                return Err(Madness::from(e))
            },
        };


        let member_ids: Vec<i64> = members.iter().map(|pilot| pilot.character_id).collect();

        // Ensure the characters table is up to date. If the character is known we only need to update the
        // last_seen timestamp, if however the character is not known we will look them up with ESI and insert them into the DB
        let now = chrono::Utc::now().timestamp();
        {
            let characters = character::lookup(self.get_db(), &member_ids).await?;
            for &id in &member_ids {
                if characters.contains_key(&id) {
                    sqlx::query!("UPDATE `character` SET `last_seen`= ? WHERE `id`=?", now, id)
                        .execute(self.get_db())
                        .await?;
                }
                else {
                    let character_info: CharacterResponse = self
                        .esi_client
                        .get(
                            &format!("/v5/characters/{}/", id),
                            fleet.boss_id,
                            ESIScope::PublicData,
                        )
                        .await?;

                    sqlx::query!(
                        "REPLACE INTO `character` (id, name, last_seen) VALUES (?, ?, ?)",
                        id,
                        character_info.name,
                        now
                    )
                    .execute(self.get_db())
                    .await?;
                }
            }
        }

        // Now the characters table is up to date, we can remove pilots from the waitlist who are in fleet.
        // The return type is a Bool that will be used to conditionally alert all users to a waitlist status change at the end of the updater
        let waitlist_changed: bool = {
            let mut changed = false;

            // Get the characters on the waitlist
            let waitlist: HashMap<i64, _> = sqlx::query!("SELECT entry_id, waitlist_id, character_id, is_alt FROM waitlist_entry_fit JOIN waitlist_entry ON waitlist_entry_fit.entry_id=waitlist_entry.id")
                .fetch_all(self.get_db())
                .await?
                .into_iter()
                .map(|r| (r.character_id, r))
                .collect();


            let mut tx = self.get_db().begin().await?;
            for &id in &member_ids {
                if let Some(pilot_on_wl) = waitlist.get(&id) {
                    changed = true;

                    sqlx::query!("DELETE FROM waitlist_entry_fit WHERE entry_id=?", pilot_on_wl.entry_id)
                        .execute(&mut tx)
                        .await?;
                }
            }
            sqlx::query!("DELETE FROM waitlist_entry WHERE id NOT IN (SELECT entry_id FROM waitlist_entry_fit)")
                .execute(&mut tx)
                .await?;

            tx.commit().await?;

            changed
        };

        // Next update the fleet_activity table which is used for tracking flight time and displaying the fleet comp
        // The return type is a Bool that will be used to conditionally alert FCs if the fleet comp has changed
        let mut boss_system_changed: bool = false;
        let fleet_comp_changed: bool = {
            let mut changed = false;
            let now = chrono::Utc::now().timestamp();

            let mut tx = self.get_db().begin().await?;
            let in_fleet: HashMap<i64, _> = sqlx::query!("SELECT * FROM fleet_activity WHERE fleet_id=? AND has_left=0", fleet_id)
                .fetch_all(&mut tx)
                .await?
                .into_iter()
                .map(|r| (r.character_id, r))
                .collect();


            // Is ESI reporting enough pilots to satisfy the min pilots required for the fleet updater as specified in config.toml?
            let min_pilots_in_fleet: bool = members.len() >= self.config.fleet_updater.min_in_fleet;

            for member in &members {
                let is_boss: i8 = {
                    if member.character_id == fleet.boss_id {
                        1
                    } else {
                        0
                    }
                };
                //  member.character_id == fleet.boss_id;

                if is_boss == 1 && fleet.boss_system_id.is_none() || fleet.boss_system_id.unwrap() != member.solar_system_id {
                    sqlx::query!("UPDATE fleet SET boss_system_id=? WHERE id=?", member.solar_system_id, fleet_id)
                        .execute(&mut tx)
                        .await?;

                    boss_system_changed = true;
                }

                if min_pilots_in_fleet {
                    let mut insert_record: bool = false;
                    if let Some(in_db) = in_fleet.get(&member.character_id) {
                        if in_db.hull == member.ship_type_id && in_db.is_boss == is_boss {
                            if in_db.last_seen < now - 60 {
                                sqlx::query!("UPDATE fleet_activity SET last_seen=? WHERE id=?", now, in_db.id)
                                    .execute(&mut tx)
                                    .await?;

                                changed = true;
                            }
                        }
                        else {
                            sqlx::query!("UPDATE fleet_activity SET has_left=1, last_seen=? WHERE id=?", now, in_db.id)
                                .execute(&mut tx)
                                .await?;

                            insert_record = true;
                        }
                    } else {
                        // If the member (from ESI) is not in the database then they've joined fleet
                        // so we need to add them to the fleet activity table
                        insert_record = true;
                    }

                    if insert_record {
                        sqlx::query!(
                            "INSERT INTO fleet_activity (character_id, fleet_id, first_seen, last_seen, is_boss, hull, has_left) VALUES (?, ?, ?, ?, ?, ?, 0)",
                            member.character_id, fleet_id, now, now, is_boss, member.ship_type_id,
                        ).execute(&mut tx).await?;

                        changed = true;
                    }
                }
            }

            let members_map: HashMap<i64, _> = members
                .into_iter()
                .map(|r| (r.character_id, r))
                .collect();

            for (id, pilot) in in_fleet {
                // Remove pilots from fleet_activity if they are no longer in fleet
                if !members_map.contains_key(&id) {
                    sqlx::query!("UPDATE fleet_activity SET has_left=1 WHERE id=?", pilot.id)
                        .execute(&mut tx)
                        .await?;

                    changed = true;
                }
            }

            // handle people who left fleet
            tx.commit().await?;

            changed
        };

        // Send an SSE Broadcast to ALL to notify users that pilots have been removed from the waitlist.
        if waitlist_changed {
            #[derive(Debug, Serialize)]
            struct WaitlistUpdate {
                waitlist_id: i64
            }

            self.sse_client.submit(vec![sse::Event::new_json(
                "waitlist",
                "waitlist_update",
                &WaitlistUpdate { waitlist_id: 1 }
            )])
            .await?;
        }

        // Send an SSE Broadcast to FCs to notify them that the fleet comp and settings have been updated
        if fleet_comp_changed {
            #[derive(Debug, Serialize)]
            struct NewFleetComp {
                fleet_id: i64,
            }

            self.sse_client.submit(vec![sse::Event::new_json(
                "waitlist",
                "fleets_updated",
                "comp_updated"
            )])
            .await?;

            self.sse_client.submit(vec![sse::Event::new_json(
                "waitlist",
                "comp_updated",
                &NewFleetComp { fleet_id: fleet_id }
            )])
            .await?;
        // use an else if because we don't want to send a boss changed notification if we're already sending an updated fleet notification
        } else if boss_system_changed {
            self.sse_client.submit(vec![sse::Event::new_json(
                "waitlist",
                "fleets_updated",
                "boss_system_updated"
            )])
            .await?;
        }

        Ok(())
    }
}
