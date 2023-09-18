use crate::core::esi::ESIScope;
use crate::{core::auth::AuthenticatedAccount, app::Application, util::madness::Madness};
use eve_data_core::TypeDB;
use crate::core::sse::Event;
use serde::Serialize;

#[delete("/api/v2/fleets/<fleet_id>")]
async fn delete_fleet(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64
) -> Result<&'static str, Madness> {
    account.require_access("fleet-view")?;

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


    let squad_info = sqlx::query!(
        "SELECT wing_id, squad_id FROM `fleet_squad` WHERE fleet_id=? AND category='logi'",
        fleet_id
    )
    .fetch_optional(app.get_db())
    .await?;

    let fleet_boss = sqlx::query!(
        "SELECT boss_id FROM fleet WHERE id=?", fleet_id
    )
    .fetch_one(app.get_db())
    .await?;

    #[derive(Debug, Serialize)]
    struct Invite {
        character_id: i64,
        role: &'static str
    }

    let mut invited_characters = Vec::new();
    // Invite all logi ASAP, we'll notify them after
    for pilot in &pilots {
        if invited_characters.contains(&pilot.character_id) {
            continue;
        }

        app.esi_client
            .post_204(
                &format!("/v1/fleets/{}/members", fleet_id),
                &Invite {
                    character_id: pilot.character_id,
                    role: "squad_member"
                },
                fleet_boss.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await?;

            invited_characters.push(pilot.character_id)
    }

    let mut alerted_accounts: Vec<i64> = Vec::new();
    for pilot in pilots {
        if alerted_accounts.contains(&pilot.account_id) {
            continue;
        }

        app.sse_client
        .submit(vec![Event::new(
            &format!("account;{}", &pilot.account_id),
            "emergency",
            TypeDB::name_of(pilot.hull)?
        )])
        .await?;

        alerted_accounts.push(pilot.account_id)
    }

    Ok("Ok")
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        delete_fleet,   //  POST    /api/v2/fleets/<fleet_id>
        oh_shit,        //  POST    /api/v2/fleets/<fleet_id>/actions/oh-shit
    ]
}
