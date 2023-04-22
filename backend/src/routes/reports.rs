use crate::{
    core::auth::AuthenticatedAccount,
    app::Application,
    util::madness::Madness
};

use serde::Serialize;
use rocket::serde::json::Json;

#[derive(Debug, Serialize)]
struct Report {
    fc: Vec<ReportRow>,
    logi: Vec<ReportRow> 
}

#[derive(Debug, Serialize)]
struct ReportRow {
    id: i64,
    name: String,
    hours_last_month: Option<i64>,
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
        "SELECT
            c.id as `id!`,
            c.name as `name!`,
            (SELECT fa.last_seen FROM `fleet_activity` AS fa WHERE fa.character_id=c.id AND fa.is_boss=true AND (fa.last_seen - fa.first_seen > 300) ORDER BY fa.last_seen DESC LIMIT 1) as `last_seen`,
            (SELECT SUM(fa.last_seen - fa.first_seen)  FROM `fleet_activity` as fa WHERE fa.character_id = c.id AND fa.is_boss = true AND (fa.last_seen - fa.first_seen) > 300) as `hours_last_month: i64`
        FROM
            `character` as c
        WHERE
            c.id IN (SELECT DISTINCT `character_id` FROM `admin`)
        "
    )
    .fetch_all(app.get_db())
    .await?;

    let logi = sqlx::query_as!(
        ReportRow,
        "SELECT
            c.id as `id!`,
            c.name as `name!`,
            (SELECT fa.last_seen FROM `fleet_activity` AS fa WHERE fa.character_id=c.id AND (fa.hull=? OR fa.hull=?) AND (fa.last_seen - fa.first_seen > 300) ORDER BY fa.last_seen DESC LIMIT 1) as `last_seen`,
            (SELECT (SUM(ff.last_seen - ff.first_seen))  FROM `fleet_activity` as ff WHERE ff.character_id = c.id AND (ff.hull=? OR ff.hull=?) AND (ff.last_seen - ff.first_seen) > 300) as `hours_last_month: i64`            
        FROM
            `character` as c
        WHERE
            c.id IN (SELECT DISTINCT `character_id` FROM `admin`)",
            type_id!("Nestor"),
            type_id!("Oneiros"),
            type_id!("Nestor"),
            type_id!("Oneiros")
    )
    .fetch_all(app.get_db())
    .await?;

    let reports = Report {
        fc,
        logi
    };
    return Ok(Json(reports))
}

pub fn routes() -> Vec<rocket::Route> {
    routes![get_reports]
}