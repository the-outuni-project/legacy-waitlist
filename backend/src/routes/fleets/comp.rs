use crate::{core::auth::AuthenticatedAccount, app::Application, util::{madness::Madness, types::{Hull, Character}}};
use eve_data_core::TypeDB;
use rocket::serde::json::Json;
use serde::Serialize;

#[derive(Serialize, Debug)]
struct FleetMember {
    character: Character,
    hull: Hull
}

#[get("/api/v2/fleets/<fleet_id>/comp")]
async fn fleet(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    fleet_id: i64
) -> Result<Json<Vec<FleetMember>>, Madness> {
    let fleet_members = sqlx::query!(
        "SELECT
            c.id,
            c.name,
            hull
        FROM
            fleet_activity
        JOIN
            `character` as c ON c.id=character_id
        WHERE
            fleet_id=? AND has_left=0",
        fleet_id
    ).fetch_all(app.get_db())
    .await?
    .into_iter()
    .map(|r| FleetMember {
        character: Character {
            id: r.id,
            name: r.name,
            corporation_id: None
        },
        hull: Hull {
            id: r.hull,
            name: match TypeDB::load_type(r.hull) {
                Ok(t) => t.name.to_string(),
                _ => "Unknown".to_string()
            }
        }
    })
    .collect();

    Ok(Json(fleet_members))
}



pub fn routes() -> Vec<rocket::Route> {
    routes![
        fleet,      //  GET    /api/v2/fleets/<fleet_id>/comp
    ]
}
