use eve_data_core::Fitting;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

use crate::{
    app::Application,
    core::auth::AuthenticatedAccount,
    data::{implants, skills},
    tdf::{
        self,
        fitcheck::{Output, PilotData, PubAnalysis},
    },
    util::madness::Madness,
};

#[derive(Debug, Deserialize)]
struct XupRequest {
    character_id: i64,
    eft: String,
}

#[derive(Debug, Serialize)]
pub struct FitResult {
    pub approved: bool,
    pub fit_analysis: Option<PubAnalysis>,
    pub dna: String,
}

#[post("/api/fit-check", data = "<input>")]
async fn fitcheck(
    account: AuthenticatedAccount,
    app: &rocket::State<Application>,
    input: Json<XupRequest>,
) -> Result<Json<Vec<FitResult>>, Madness> {
    let fits: Vec<Fitting> = Fitting::from_eft(&input.eft)?;

    let pilot: PilotData = PilotData {
        implants: &implants::get_implants(app, input.character_id).await?,
        time_in_fleet: 0,
        skills: &skills::load_skills(&app.esi_client, app.get_db(), input.character_id).await?,
        access_keys: account.access,
        id: &input.character_id,
    };

    let badges: Vec<String> = sqlx::query!(
        "SELECT badge.name FROM badge JOIN badge_assignment ON id=badge_assignment.BadgeId WHERE badge_assignment.CharacterId=?", input.character_id
    )
    .fetch_all(app.get_db())
    .await?
    .into_iter()
    .map(|b| {
        b.name
    })
    .collect();

    let mut result = Vec::new();

    for fit in fits {
        let fit_checked: Output = tdf::fitcheck::FitChecker::check(&pilot, &fit, &badges).await?;

        if let Some(error) = fit_checked.errors.into_iter().next() {
            return Err(Madness::BadRequest(error));
        }

        result.push(FitResult {
            approved: fit_checked.approved,
            fit_analysis: fit_checked.analysis,
            dna: fit.to_dna()?,
        });
    }

    Ok(Json(result))
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        fitcheck    // POST /api/fit-check
    ]
}
