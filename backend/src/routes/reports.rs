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
    hours_last_month: i64,
    last_seen: Option<i64>
}

#[get("/api/reports")]
async fn get_reports(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
) -> Result<Json<Report>, Madness> {
    account.require_access("reports-view")?;

    let fc_query = sqlx::query!(
        "SELECT
            c.id,
            c.name,
            (SELECT fa.last_seen FROM `fleet_activity` AS fa WHERE fa.character_id=c.id AND fa.is_boss=true AND (fa.last_seen - fa.first_seen > 300) ORDER BY fa.last_seen DESC LIMIT 1) as `last_seen`
        FROM
            `character` as c
        WHERE
            c.id IN (SELECT DISTINCT `character_id` FROM `admin`)"
    )
    .fetch_all(app.get_db())
    .await?;

    let fc_report: Vec<ReportRow> = fc_query
        .into_iter()
        .map(|r| ReportRow {
            id: r.id,
            name: r.name,
            last_seen: r.last_seen,
            hours_last_month: 0
        })
        .collect();

    let reports = Report {
        fc: fc_report,
        logi: Vec::new()
    };
    return Ok(Json(reports))
}

pub fn routes() -> Vec<rocket::Route> {
    routes![get_reports]
}