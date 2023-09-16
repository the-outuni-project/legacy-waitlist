use crate::{
    app::Application,
    core::{auth::{AuthenticatedAccount, authorize_character}, esi::{ESIScope, ESIError}},
    util::{
        madness::Madness,
        types::Character,
    }, data::fleets as fleet_data, routes::fleet,
};

use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct FleetSummary {
    id: i64,
    boss: Character,
    // boss_system: None,
    is_listed: bool,
    size: i8,
    size_max: i8
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
            fc.id as `boss_id`,
            fc.name  as `boss_name`
        FROM
            fleet
        JOIN `character` as fc ON fc.id=fleet.boss_id"
    )
    .fetch_all(app.get_db())
    .await?
    .into_iter()
    .map(|row| FleetSummary {
        id: row.id,
        boss: Character {
            id: row.boss_id,
            name: row.boss_name,
            corporation_id: None
        },
        //boss_system: None,
        is_listed: false,
        size: 0,
        size_max: 0
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

    Ok("ok")
}

#[post("/api/v2/fleets", data = "<body>")]
async fn register(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    body: Json<FleetRegistration>,
) -> Result<&'static str, Madness> {
    account.require_access("fleet-view")?;

    // Authorize character with ESI (needed for the various /fleet/ calls)
    authorize_character(app.get_db(), &account, body.boss_id, None).await?;

    #[derive(Debug, Deserialize)]
    struct FleetInfo {
        fleet_id: i64,
        fleet_boss_id: i64
    }

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
        "INSERT INTO fleet (id, boss_id) VALUES (?, ?)",
        basic_info.fleet_id,
        basic_info.fleet_boss_id
    )
    .execute(&mut tx)
    .await?;


    if body.default_squads {
        // If the FC selects "Use Default MOTD" we need to build the fleet using ESI
        // and then save those squads to the database

        // Start by resetting the fleet
        #[derive(Debug, Deserialize)]
        struct WingInfo {
            id: i64,
        }

        #[derive(Debug, Serialize)]
        struct Empty {}

        #[derive(Debug, Serialize)]
        struct WingName {
            name: String
        }

        let wings : Vec<WingInfo> = app
            .esi_client
            .get(
                &format!("/v1/fleets/{}/wings", basic_info.fleet_id),
                body.boss_id,
                ESIScope::Fleets_ReadFleet_v1,
            )
            .await?;

        for wing in wings {
            app.esi_client
                .delete(
                    &format!("/v1/fleets/{}/wings/{}", basic_info.fleet_id, wing.id),
                    body.boss_id,
                    ESIScope::Fleets_WriteFleet_v1,
                )
                .await?;
        }

        for wing in fleet_data::load_default_squads().await {
            app.esi_client.post(
                &format!("/v1/fleets/{}/wings", basic_info.fleet_id),
                &Empty {},
                body.boss_id,
                ESIScope::Fleets_WriteFleet_v1
            )
            .await?;
        }
        // let new_structure = fleet_data::load_default_squads().await;
        // for

        // // Then we need to create our new wings, squads and add them to the DB
        // for wing in fleet_data::load_default_squads().await {
        //     let wing_name = &wing.name;

        //     let new_wing : CreateWingResponse = app.esi_client.post(
        //         &format!("/v1/fleets/{}/wings", basic_info.fleet_id),
        //         &Empty {},
        //         body.boss_id,
        //         ESIScope::Fleets_WriteFleet_v1
        //     )
        //     .await?;

        //     app.esi_client.put(
        //         &format!("/v1/fleets/{}/wings/{}", basic_info.fleet_id, new_wing.wing_id),
        //         &WingName {
        //             name: wing_name.to_string()
        //         },
        //         body.boss_id,
        //         ESIScope::Fleets_WriteFleet_v1
        //     )
        //     .await?;

        //     for squad in wing.squads {
        //         let w = wing_name;
        //         let s = squad;
        //     }
        // }

        // get seed
        // foreach wing
            // use ESI to create, capture ID
                // foreach squad
                    // use ESI to create, capture ID
                    // insert into fleet_squads with Fleet ID, Wing ID, and Squad ID
    }

    // Commit the database transaction
    tx.commit().await?;

    // let fleet_id = esi.get_fleet()

    // insert into fleet (id, boss_id)

    // if (squads) {
    // create
    /*
         On Grid
            > Logistics
            > Bastion
            > DPS/Snipers
            > Alts
        Off Grid
            > Scout
            > Scout 2
            > Other
     */
    // insert into squad table ^
    //}
    // else
    // {
    //  use mapped values from req.body to insert into DB
    //}

    // if (MOTD) {
    // update MOTD
    // }
    //

    // return URL to fleet

    let r = body;

    Ok("ok")
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        fleets,     // GET      /api/v2/fleets
        close_all,  // DELETE   /api/v2/fleets
        register    // POST     /api/v2/fleets
    ]
}
