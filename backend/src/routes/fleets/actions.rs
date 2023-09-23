use crate::core::esi::ESIScope;
use crate::{core::auth::AuthenticatedAccount, app::Application, util::madness::Madness};
use eve_data_core::TypeDB;
use crate::core::sse::Event;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
struct Invite {
    character_id: i64,
    role: &'static str
}

#[derive(Debug, Serialize)]
struct SquadInvite {
    character_id: i64,
    role: &'static str,
    squad_id: i64,
    wing_id: i64,
}

#[delete("/api/v2/fleets/<fleet_id>")]
async fn delete_fleet(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64
) -> Result<&'static str, Madness> {
    account.require_access("fleet-view")?;

    let fleet = sqlx::query!(
        "SELECT boss_id FROM fleet WHERE id=?", fleet_id
    )
    .fetch_one(app.get_db())
    .await?;


    let fleet_members = crate::core::esi::fleet_members::get(&app.esi_client, fleet_id, fleet.boss_id).await?;

    for member in fleet_members {
        if member.character_id == fleet.boss_id {
            continue; // Don't try to kick fleet boss as it will error!
        }

        let res = app
            .esi_client
            .delete(
                &format!("/v1/fleets/{}/members/{}/", fleet_id, member.character_id),
                fleet.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await?;
    }


    let mut tx = app.get_db().begin().await?;
    sqlx::query!("DELETE FROM fleet_squad WHERE fleet_id=?", fleet_id)
        .execute(&mut tx)
        .await?;

    sqlx::query!("DELETE FROM fleet WHERE id=?", fleet_id)
        .execute(&mut tx)
        .await?;

    sqlx::query!("UPDATE `fleet_activity` SET has_left=1 WHERE fleet_id = ? AND has_left = 0", fleet_id)
        .execute(&mut tx)
        .await?;

    tx.commit().await?;

    app.sse_client.submit(vec![Event::new_json(
        "fleet",
        "fleets",
        "closed",
    )])
    .await?;

    app.sse_client.submit(vec![Event::new_json(
        "waitlist",
        "fleets_updated",
        "fleet_deleted",
    )])
    .await?;

    Ok("Ok")
}

#[post("/api/v2/fleets/<fleet_id>/actions/oh-shit")]
async fn oh_shit(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64
) -> Result<&'static str, Madness> {
    account.require_access("fleet-view")?;

    let pilots = sqlx::query!(
        "SELECT
            character_id,
            fit.hull,
            we.account_id
        FROM
            waitlist_entry_fit
        JOIN
            fitting as fit ON fit.id=fit_id
        JOIN
            waitlist_entry as we ON we.id=entry_id
        WHERE
            fit.hull = ? OR fit.hull = ?",
        type_id!("Nestor"),
        type_id!("Oneiros")
    )
    .fetch_all(app.get_db())
    .await?;

    let fleet = sqlx::query!(
        "SELECT boss_id FROM fleet WHERE id=?", fleet_id
    )
    .fetch_one(app.get_db())
    .await?;

    let mut max_esi_errors = 10;
    let mut invited_characters = Vec::new();
    let mut accounts: HashMap<i64, String> = HashMap::new(); //Vec<i64> = Vec::new();

    // Invite all logi ASAP, we'll notify them after
    for pilot in &pilots {
        if invited_characters.contains(&pilot.character_id) {
            continue;
        }

        let res = app.esi_client
            .post_204(
                &format!("/v1/fleets/{}/members", fleet_id),
                &Invite {
                    character_id: pilot.character_id,
                    role: "squad_member"
                },
                fleet.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await;

        if res.is_err() && max_esi_errors > 0 {
            max_esi_errors =- 1;
            continue;
        }
        else if res.is_err() && max_esi_errors == 0 {
            break;
        }

        // Add the character to this list so we make sure
        // we don't invite them to fleet a second time
        invited_characters.push(pilot.character_id);


        // Add the account to our notification list
        if !accounts.contains_key(&pilot.account_id) {
            accounts.insert(pilot.account_id, TypeDB::name_of(pilot.hull)?);
        }
    }

    for (account_id, hull_name) in accounts {
        app.sse_client.submit(vec![Event::new(
            &format!("account;{}", account_id),
            "emergency",
            hull_name
        )])
        .await?
    }

    Ok("Ok")
}


#[post("/api/v2/fleets/<fleet_id>/actions/invite-all")]
async fn invite_all(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64
) -> Result<&'static str, Madness> {
    account.require_access("waitlist-view")?;

    let fleet = sqlx::query!(
        "SELECT boss_id, max_size FROM fleet WHERE id=?", fleet_id
    )
    .fetch_one(app.get_db())
    .await?;

    let fleet_members = crate::core::esi::fleet_members::get(
        &app.esi_client,
        fleet_id,
        fleet.boss_id
    ).await?;

    let pilots = sqlx::query!(
        "
            SELECT character_id, category, fit.hull, we.account_id FROM waitlist_entry_fit JOIN fitting as fit ON fit.id=fit_id JOIN waitlist_entry as we ON we.id=entry_id WHERE fit.hull=?
            UNION DISTINCT
            SELECT character_id, category, fit.hull, we.account_id FROM waitlist_entry_fit JOIN fitting as fit ON fit.id=fit_id JOIN waitlist_entry as we ON we.id=entry_id WHERE fit.hull=? OR fit.hull=?
            UNION DISTINCT
            SELECT character_id, category, fit.hull, we.account_id FROM waitlist_entry_fit JOIN fitting as fit ON fit.id=fit_id JOIN waitlist_entry as we ON we.id=entry_id WHERE is_alt=0
        ",
        type_id!("Nestor"),
        type_id!("Kronos"),
        type_id!("Paladin")
    )
    .fetch_all(app.get_db())
    .await?;

    let fc = sqlx::query!("SELECT name FROM `character` WHERE id=?", fleet.boss_id)
        .fetch_one(app.get_db())
        .await?;


    let mut error_count = 10;
    let mut invite_count = fleet_members.len();
    let mut invited_characters: Vec<i64> = Vec::new();

    for pilot in pilots {
        if invited_characters.contains(&pilot.character_id) {
            continue;   // Character has already been invited
        }

        if invite_count as i64 >= fleet.max_size {
            return Ok("");
        }

        let target_squad = match sqlx::query!(
            "SELECT category, wing_id, squad_id FROM fleet_squad WHERE fleet_id=? AND category=?",
            fleet_id, pilot.category
        )
        .fetch_optional(app.get_db())
        .await?
        {
            Some(squad) => squad,
            None => return Err(Madness::BadRequest(format!("Fleet not configured.")))
        };

        let esi_res = app.esi_client
            .post_204(
                &format!("/v1/fleets/{}/members", fleet_id),
                &SquadInvite {
                    character_id: pilot.character_id,
                    role: "squad_member",
                    squad_id: target_squad.squad_id,
                    wing_id: target_squad.wing_id,
                },
                fleet.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await;

        if esi_res.is_err() {
            error_count -= 1;
            if error_count <= 0 {
                return Err(Madness::BadRequest(format!("ESI Error cap reached, please invite manually!")));
            }
            continue;
        }

        invite_count += 1;
        invited_characters.push(pilot.character_id);

        app.sse_client
        .submit(vec![Event::new(
            &format!("account;{}", pilot.account_id),
            "message",
            format!(
                "{} has invited your {} to fleet.",
                fc.name,
                TypeDB::name_of(pilot.hull)?
            ),
        )])
        .await?;
    }

    let alts = sqlx::query!(
        "SELECT character_id, category, fit.hull, we.account_id FROM waitlist_entry_fit JOIN fitting as fit ON fit.id=fit_id JOIN waitlist_entry as we ON we.id=entry_id WHERE is_alt=1"
    )
    .fetch_all(app.get_db())
    .await?;

    for alt in alts {
        if invited_characters.contains(&alt.character_id) {
            continue;   // Character has already been invited
        }

        if invite_count as i64 >= fleet.max_size {
            return Ok("");
        }

        let target_squad = match sqlx::query!(
            "SELECT category, wing_id, squad_id FROM fleet_squad WHERE fleet_id=? AND category='alt'",
            fleet_id
        )
        .fetch_optional(app.get_db())
        .await?
        {
            Some(squad) => squad,
            None => return Err(Madness::BadRequest(format!("Fleet not configured.")))
        };

        let esi_res = app.esi_client
            .post_204(
                &format!("/v1/fleets/{}/members", fleet_id),
                &SquadInvite {
                    character_id: alt.character_id,
                    role: "squad_member",
                    squad_id: target_squad.squad_id,
                    wing_id: target_squad.wing_id,
                },
                fleet.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await;

        if esi_res.is_err() {
            error_count -= 1;

            if error_count <= 0 {
                return Err(Madness::BadRequest(format!("ESI Error cap reached, please invite manually!")));
            }

            continue;
        }

        invite_count += 1;
        invited_characters.push(alt.character_id);

        app.sse_client
        .submit(vec![Event::new(
            &format!("account;{}", alt.account_id),
            "message",
            format!(
                "{} has invited your {} to fleet.",
                fc.name,
                TypeDB::name_of(alt.hull)?
            ),
        )])
        .await?;
    }

    Ok("Ok")
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        delete_fleet,   //  POST    /api/v2/fleets/<fleet_id>
        invite_all,     //  POST    /api/v2/fleets/<fleet_id>/actions/invite-all
        oh_shit,        //  POST    /api/v2/fleets/<fleet_id>/actions/oh-shit
    ]
}
