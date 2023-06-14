use crate::{
    core::auth::AuthenticatedAccount,
    app::Application,
    util::madness::Madness
};

use serde::Serialize;
use rocket::serde::json::Json;
use bigdecimal::BigDecimal;

#[derive(Debug, Serialize)]
struct Report {
    fc: Vec<ReportRow>,
    logi: Vec<ReportRow> 
}

#[derive(Debug, Serialize)]
struct ReportRow {
    id: i64,
    name: String,
    seconds_last_month: Option<BigDecimal>,
    last_seen: Option<i64>
}

#[get("/api/reports")]
async fn get_reports(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
) -> Result<Json<Report>, Madness> {
    account.require_access("reports-view")?;

    let fc = sqlx::query_as!(
        ReportRow,
        "SELECT c.id AS `id`, c.name AS `name`, MAX(fa.last_seen) AS `last_seen`, SUM(fa.last_seen - fa.first_seen) AS `seconds_last_month` FROM `character` AS c JOIN `admin` AS a on a.character_id = c.id LEFT JOIN fleet_activity AS fa ON fa.character_id = c.id AND fa.is_boss = 'true' AND (fa.last_seen - fa.first_seen) > 300 GROUP BY `id`, `name`"
    )
    .fetch_all(app.get_db())
    .await?;

    let logi = sqlx::query_as!(
        ReportRow,
        "SELECT c.id AS `id!`, c.name AS `name!`, MAX(fa.last_seen) AS `last_seen`, SUM(fa.last_seen - fa.first_seen) AS `seconds_last_month` FROM `character` AS c JOIN badge_assignment AS ba ON ba.characterId = c.id JOIN badge AS b ON b.id = ba.badgeID AND b.name = 'LOGI' LEFT JOIN fleet_activity AS fa ON fa.character_id = c.id AND (fa.hull=? OR fa.hull=?) AND (fa.last_seen - fa.first_seen) > 300 GROUP BY c.id, c.name",
            type_id!("Nestor"),
            type_id!("Oneiros"),
    )
    .fetch_all(app.get_db())
    .await?;

    let reports = Report {
        fc,
        logi
    };
    println!("{:#?}", reports);
    return Ok(Json(reports))
}

pub fn routes() -> Vec<rocket::Route> {
    routes![get_reports]
}