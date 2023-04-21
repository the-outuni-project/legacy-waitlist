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
    last_seen: i64
}

#[get("/api/reports")]
async fn reports(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
) -> Result<Json<Report>, Madness> {
    account.require_access("reports-view")?;

    let v = Report {
        fc: Vec::new(),
        logi: Vec::new()
    };
    return Ok(Json(v))
}

pub fn routes() -> Vec<rocket::Route> {
    routes![reports]
}