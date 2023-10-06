use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

use crate::{
    app::Application,
    core::{auth::AuthenticatedAccount, sse::Event},
    util::madness::Madness,
};

#[derive(Debug, Deserialize)]
struct MessageRequest {
    id: i64,
    message: String,
}

#[derive(Debug, Serialize)]
struct MessageNotification {
    title: String,
    message: String,
}

#[post("/api/waitlist/message", data = "<input>")]
async fn send_message(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount,
    input: Json<MessageRequest>,
) -> Result<&'static str, Madness> {
    account.require_access("waitlist-manage")?;

    let entry = sqlx::query!(
        "
            SELECT account_id, entry_id, fit_id FROM waitlist_entry_fit wef
            JOIN waitlist_entry we ON we.id=wef.entry_id WHERE wef.id=?
        ",
        input.id
    )
    .fetch_one(app.get_db())
    .await?;

    sqlx::query!(
        "UPDATE waitlist_entry_fit SET review_comment=? WHERE id=?",
        input.message,
        input.id
    )
    .execute(app.get_db())
    .await?;

    let user = sqlx::query!(
        "SELECT name FROM `character` WHERE id=?",
        account.id
    )
    .fetch_one(app.get_db())
    .await?;

    super::notify::notify_waitlist_update(app, 1).await?;
    app.sse_client
        .submit(vec![Event::new_json(
            &format!("account;{}", entry.account_id),
            "message",
            &MessageNotification {
                message: input.message.to_string(),
                title: format!("{} has sent you a message.", user.name)
                    .to_string(),
            },
        )])
        .await?;

    Ok("OK")
}

pub fn routes() -> Vec<rocket::Route> {
    routes![send_message]
}
