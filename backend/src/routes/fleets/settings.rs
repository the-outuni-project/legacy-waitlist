use crate::util::types::{Character, System};
use crate::{core::auth::AuthenticatedAccount, util::madness::Madness, app::Application};
use eve_data_core::TypeDB;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

use super::notify;

#[derive(Debug, Serialize)]
struct FleetSettings {
    boss: Character,
    boss_system: Option<System>,
    size: i64,
    size_max: i64,
    visible: bool
}

#[derive(Debug, Deserialize)]
struct FleetBossReq {
    fleet_boss: i64
}

#[derive(Debug, Deserialize)]
struct FleetVisibilityReq {
    visible: bool
}

#[derive(Debug, Deserialize)]
struct FleetSizeReq {
    max_size: i64
}

#[get("/api/v2/fleets/<fleet_id>")]
async fn get_fleet(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64,
) -> Result<Json<FleetSettings>, Madness> {
    account.require_access("fleet-view")?;

    if let Some(fleet) = sqlx::query!(
        "SELECT
            fleet.id,
            fleet.boss_system_id,
            fleet.visible as `visible:bool`,
            fc.id as `boss_id`,
            fc.name  as `boss_name`,
            fleet.max_size,
            COUNT(DISTINCT fa.character_id) as `size`
        FROM fleet
        JOIN `character` as fc ON fc.id=fleet.boss_id
        LEFT JOIN `fleet_activity` as fa ON fa.fleet_id=fleet.id
        WHERE fleet.id = ?
        GROUP BY fleet.id",
        fleet_id
    )
    .fetch_optional(app.get_db())
    .await? {
        return Ok(Json(FleetSettings {
            boss: Character {
                id: fleet.boss_id,
                name: fleet.boss_name,
                corporation_id: None
            },
            boss_system: match fleet.boss_system_id {
                Some(system_id) => Some(System{
                    id: system_id,
                    name: match TypeDB::name_of_system(system_id) {
                        Ok(name) => name.to_string(),
                        _ => "Unknown System".to_string()
                    }
                }),
                None => None
            },
            size: fleet.size,
            size_max: fleet.max_size,
            visible: fleet.visible
        }))
    }

    return Err(Madness::NotFound("Fleet not found."))
}


#[post("/api/v2/fleets/<fleet_id>/boss", data = "<body>")]
async fn set_boss(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64,
    body: Json<FleetBossReq>,
) -> Result<&'static str, Madness> {
    account.require_access("fleet-view")?;

    if let Some(_) = sqlx::query!("SELECT * FROM `fleet` WHERE id=?", fleet_id)
    .fetch_optional(app.get_db())
    .await? {
        sqlx::query!("UPDATE `fleet` SET boss_id=? WHERE id=?", body.fleet_boss, fleet_id)
        .execute(app.get_db())
        .await?;
    }

    notify::fleets_updated(&app, "fleet_settings", Some(fleet_id)).await?;

    Ok("Ok")
}

#[post("/api/v2/fleets/<fleet_id>/visibility", data = "<body>")]
async fn set_visibility(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64,
    body: Json<FleetVisibilityReq>,
) -> Result<&'static str, Madness> {
    account.require_access("fleet-view")?;


    if let Some(_) = sqlx::query!("SELECT * FROM `fleet` WHERE id=?", fleet_id)
        .fetch_optional(app.get_db())
        .await? {
            sqlx::query!("UPDATE `fleet` SET visible=? WHERE id=?", body.visible, fleet_id)
            .execute(app.get_db())
            .await?;
        }

    notify::fleets_updated(&app, "fleet_settings", Some(fleet_id)).await?;
    notify::waitlist_state(&app, "visibility").await?;

    Ok("Ok")
}

#[post("/api/v2/fleets/<fleet_id>/size", data = "<body>")]
async fn set_size(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64,
    body: Json<FleetSizeReq>,
) -> Result<&'static str, Madness> {
    account.require_access("fleet-view")?;

    if let Some(_) = sqlx::query!("SELECT * FROM `fleet` WHERE id=?", fleet_id)
    .fetch_optional(app.get_db())
    .await? {
        sqlx::query!("UPDATE `fleet` SET max_size=? WHERE id=?", body.max_size, fleet_id)
        .execute(app.get_db())
        .await?;
    }

    notify::fleets_updated(&app, "fleet_settings", Some(fleet_id)).await?;

    Ok("Ok")
}


pub fn routes() -> Vec<rocket::Route> {
    routes![
        get_fleet,      // GET      /api/v2/fleets/<fleet_id>
        set_boss,       // POST     /api/v2/fleets/<fleet_id>/boss
        set_size,       // POST     /api/v2/fleets/<fleet_id>/size
        set_visibility  // POST     /api/v2/fleets/<fleet_id>/visibility
    ]
}
