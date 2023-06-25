use crate::{app::Application, util::madness::Madness, core::auth::AuthenticatedAccount};
use serde::{Serialize};
use rocket::serde::json::Json;
use bigdecimal::BigDecimal;

#[derive(Debug, Serialize)]
struct Character {
  id: i64,
  name: String,
  esi_valid: bool,
  time_in_fleet: Option<BigDecimal>,
  last_in_fleet: Option<i64>
}

#[get("/api/v1/pilot/<character_id>/characters")]
async fn get_characters(
  account: AuthenticatedAccount,
  app: &rocket::State<Application>,
  character_id: i64,
) -> Result<Json<Vec<Character>>, Madness> {
  if account.id != character_id {
    account.require_access("waitlist-tag:HQ-FC")?;
  }

  let rows = sqlx::query!(
    "select account_id as `id` from alt_character where alt_id=?
    union distinct 
    select alt_id from alt_character where account_id=?
    union distinct 
    select id from `character` where id=?
    ",
    character_id,
    character_id,
    character_id
  )
  .fetch_all(app.get_db())
  .await?;

  let mut characters = Vec::new();

  for row in rows {
    let character = sqlx::query_as!(
      Character,
      "SELECT
        c.id,
        c.name,
        MAX(fa.last_seen) as `last_in_fleet`,
        SUM(fa.last_seen - fa.first_seen) AS `time_in_fleet`,
        EXISTS (SELECT character_id FROM refresh_token WHERE character_id=c.id) as `esi_valid!: bool`
      FROM 
        `character` as c
      LEFT JOIN
        fleet_activity AS fa ON fa.character_id = c.id
      WHERE
        c.id=?
      GROUP BY c.id",
      row.id
    )
    .fetch_one(app.get_db())
    .await?;

    characters.push(character);
  }

  Ok(Json(characters))
}

pub fn routes() -> Vec<rocket::Route> {
  routes![
    get_characters    // GET  // api/v1/<character_id>/:pilotId/characters
  ]
}
