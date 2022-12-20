use eve_data_core::{TypeDB, TypeID};
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

use crate::{
    app::Application,
    core::{auth::AuthenticatedAccount, sse::Event},
    util::madness::Madness,
};

#[derive(Debug, Deserialize)]
struct ApproveRequest {
    id: i64,
}

#[post("/api/waitlist/approve", data = "<input>")]
async fn approve_fit(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount,
    input: Json<ApproveRequest>,
) -> Result<&'static str, Madness> {
    account.require_access("waitlist-manage")?;

    let entry = sqlx::query!(
        "
            SELECT entry_id, waitlist_id FROM waitlist_entry_fit wef
            JOIN waitlist_entry we ON we.id=wef.entry_id WHERE wef.id=?
        ",
        input.id
    )
    .fetch_one(app.get_db())
    .await?;

    sqlx::query!(
        "UPDATE waitlist_entry_fit SET approved=1 WHERE id=?",
        input.id
    )
    .execute(app.get_db())
    .await?;

    super::notify::notify_waitlist_update(app, entry.waitlist_id).await?;

    Ok("OK")
}

#[derive(Debug, Deserialize)]
struct RejectRequest {
    id: i64,
    review_comment: String,
}

#[derive(Debug, Serialize)]
struct RejectNotification {
    title: String,
    message: String,
}

#[post("/api/waitlist/reject", data = "<input>")]
async fn reject_fit(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount,
    input: Json<RejectRequest>,
) -> Result<&'static str, Madness> {
    account.require_access("waitlist-manage")?;

    let entry = sqlx::query!(
        "
            SELECT account_id, entry_id, fit_id, waitlist_id FROM waitlist_entry_fit wef
            JOIN waitlist_entry we ON we.id=wef.entry_id WHERE wef.id=?
        ",
        input.id
    )
    .fetch_one(app.get_db())
    .await?;

    sqlx::query!(
        "UPDATE waitlist_entry_fit SET approved=0, review_comment=? WHERE id=?",
        input.review_comment,
        input.id
    )
    .execute(app.get_db())
    .await?;

    let fit = sqlx::query!("SELECT hull FROM fitting WHERE id=?", entry.fit_id)
        .fetch_one(app.get_db())
        .await?;

    super::notify::notify_waitlist_update(app, entry.waitlist_id).await?;
    app.sse_client
        .submit(vec![Event::new_json(
            &format!("account;{}", entry.account_id),
            "message",
            &RejectNotification {
                message: input.review_comment.to_string(),
                title: format!("{} Fit Rejected:", TypeDB::name_of(fit.hull as TypeID)?)
                    .to_string(),
            },
        )])
        .await?;

    Ok("OK")
}

pub fn routes() -> Vec<rocket::Route> {
    routes![approve_fit, reject_fit]
}
