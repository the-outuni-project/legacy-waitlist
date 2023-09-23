use crate::{app::Application, core::auth::AuthenticatedAccount, util::madness::Madness};

#[delete("/api/waitlist")]
async fn empty_waitlist(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount
) -> Result<&'static str, Madness> {
    account.require_access("waitlist-edit")?;

    let mut tx = app.get_db().begin().await?;

    sqlx::query!("DELETE FROM waitlist_entry_fit")
        .execute(&mut tx)
        .await?;

    sqlx::query!("DELETE FROM waitlist_entry")
        .execute(&mut tx)
        .await?;

    tx.commit().await?;

    Ok("OK")
}

pub fn routes() -> Vec<rocket::Route> {
    routes![empty_waitlist]
}
