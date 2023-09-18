use crate::{
    app::Application,
    core::{auth::{AuthenticatedAccount, authorize_character}, esi::{ESIScope, ESIError}, sse::Event},
    util::{
        madness::Madness,
        types::{Character, Empty, System},
    }, data::fleets::{self as fleet_data, FleetInfo},
};

use eve_data_core::TypeDB;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct FleetSummary {
    id: i64,
    boss: Character,
    boss_system: Option<System>,
    is_listed: bool,
    size: i64,
    size_max: i64
}

#[derive(Debug, Deserialize, Serialize)]
struct FleetRegistration {
    default_motd: bool,
    default_squads: bool,
    boss_id: i64
}


// todo: need to fix boss_system, is_listed, and size
#[get("/api/v2/fleets")]
async fn fleets(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount,
) -> Result<Json<Vec<FleetSummary>>, Madness> {
    account.require_access("fleet-view")?;

    let fleets_data = sqlx::query!(
        "SELECT
            fleet.id,
            fleet.boss_system_id,
            fleet.visible as `visible:bool`,
            fc.id as `boss_id`,
            fc.name  as `boss_name`,
            fleet.max_size,
            COUNT(DISTINCT fa.character_id) as `size`
        FROM
            fleet
        JOIN `character` as fc ON fc.id=fleet.boss_id
        LEFT JOIN `fleet_activity` as fa ON fa.fleet_id=fleet.id
        GROUP BY fleet.id"
    )
    .fetch_all(app.get_db())
    .await?
    .into_iter()
    .map(|row| {
        FleetSummary {
            id: row.id,
            boss: Character {
                id: row.boss_id,
                name: row.boss_name,
                corporation_id: None
            },
            boss_system: match row.boss_system_id {
                Some(system_id) => Some(System {
                    id: system_id,
                    name: match TypeDB::name_of_system(system_id) {
                        Ok(name) => name.to_string(),
                        _ => "Unknown".to_string()
                    }
                }),
                None => None
            },
            is_listed: row.visible,
            size: row.size,
            size_max: row.max_size
        }
    })
    .collect();

    Ok(Json(fleets_data))
}

#[delete("/api/v2/fleets")]
async fn close_all(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount,
) ->  Result<&'static str, Madness> {
    // Only Instructors/Leadership should be able to use this endpoint
    account.require_access("fleet-admin")?;

    let fleets = sqlx::query!("SELECT id FROM fleet")
        .fetch_all(app.get_db())
        .await?;

    for fleet in fleets {
     let mut tx = app.get_db().begin().await?;

        sqlx::query!("DELETE FROM fleet_squad WHERE fleet_id=?", fleet.id)
            .execute(&mut tx)
            .await?;

        sqlx::query!("DELETE FROM fleet WHERE id=?", fleet.id)
            .execute(&mut tx)
            .await?;

        tx.commit().await?;
    }

    app.sse_client.submit(vec![Event::new_json(
        "waitlist",
        "fleets_updated",
        "fleets_deleted",
    )])
    .await?;

    Ok("ok")
}

#[post("/api/v2/fleets", data = "<body>")]
async fn register(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    body: Json<FleetRegistration>,
) -> Result<String, Madness> {
    account.require_access("fleet-view")?;

    // Authorize character with ESI (needed for the various /fleet/ calls)
    authorize_character(app.get_db(), &account, body.boss_id, None).await?;

    let basic_info = app
        .esi_client
        .get(
            &format!("/v2/characters/{}/fleet", body.boss_id),
            body.boss_id,
            ESIScope::Fleets_ReadFleet_v1,
        )
        .await;

    if let Err(er) = basic_info {
        match er {
            ESIError::Status(404) => {
                return Err(Madness::NotFound("You are not in a fleet"))
            },
            e => return Err(e.into()),
        };
    };

    let basic_info: FleetInfo = basic_info.unwrap();

    // Start Database transaction
    let mut tx = app.get_db().begin().await?;

    sqlx::query!(
        "DELETE FROM fleet_squad WHERE fleet_id=?",
        basic_info.fleet_id
    )
    .execute(&mut tx)
    .await?;

    sqlx::query!(
        "REPLACE INTO fleet (id, boss_id, max_size) VALUES (?, ?, 40)",
        basic_info.fleet_id,
        basic_info.fleet_boss_id
    )
    .execute(&mut tx)
    .await?;

    // Let the FC use default squads, or map thier own for invites
    if body.default_squads {
        fleet_data::delete_all_wings(&app.esi_client, &basic_info).await?;

        #[derive(Debug, Deserialize)]
        struct NewPosition {
            #[serde(alias = "squad_id", alias = "wing_id")]
            id: i64
        }

        #[derive(Debug, Serialize)]
        struct WingName {
            name: String
        }

        // Now we need to create the new wings and squads
        for wing in fleet_data::load_default_squads().await {
            let wing_name = &wing.name;

            let new_wing: NewPosition = app.esi_client.post(
                &format!("/v1/fleets/{}/wings", basic_info.fleet_id),
                &Empty {},
                body.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await?;

            app.esi_client.put(
                &format!("/v1/fleets/{}/wings/{}", basic_info.fleet_id, new_wing.id),
                &WingName {
                    name: wing_name.to_string()
                },
                body.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await?;

            for squad in wing.squads {
                let new_squad: NewPosition = app.esi_client.post(
                    &format!("/v1/fleets/{}/wings/{}/squads", basic_info.fleet_id, new_wing.id),
                    &Empty {},
                    body.boss_id,
                    ESIScope::Fleets_WriteFleet_v1
                )
                .await?;

                app.esi_client.put(
                    &format!("/v1/fleets/{}/squads/{}", basic_info.fleet_id, new_squad.id),
                    &WingName {
                        name: squad.name.to_string()
                    },
                    body.boss_id,
                    ESIScope::Fleets_WriteFleet_v1
                )
                .await?;

                if let Some(category) = squad.map_to {
                    sqlx::query!(
                        "INSERT INTO fleet_squad (fleet_id, category, wing_id, squad_id) VALUES (?, ?, ?, ?)",
                        basic_info.fleet_id,
                        category,
                        new_wing.id,
                        new_squad.id
                    )
                    .execute(&mut tx)
                    .await?;
                }
            }
        }
    }
    else
    {
        // todo: map existing squads
    }

    // All squads are created and mapped, so it's time to commit our DB changes
    tx.commit().await?;

    if body.default_motd {
        fleet_data::set_default_motd(app.get_db(), &app.esi_client, &basic_info).await?;
    }

    app.sse_client.submit(vec![Event::new_json(
        "waitlist",
        "fleets_updated",
        "fleet_registered",
    )])
    .await?;

    Ok(format!("/fc/fleet/{}", basic_info.fleet_id))
}



pub fn routes() -> Vec<rocket::Route> {
    routes![
        fleets,     // GET      /api/v2/fleets
        close_all,  // DELETE   /api/v2/fleets
        register,   // POST     /api/v2/fleets
    ]
}
