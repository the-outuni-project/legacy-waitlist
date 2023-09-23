use crate::{
    app::Application,
    core::sse::{Event, SSEError},
};

use serde::Serialize;

#[derive(Debug, Serialize)]
struct Fleet {
    id: Option<i64>,
    key: String
}

pub async fn fleets_updated(app: &Application, setting_name: &str, fleet_id: Option<i64>) -> Result<(), SSEError> {
    app.sse_client.submit(vec![Event::new_json(
        "fleet",
        "fleet_settings",
        &Fleet { id: fleet_id, key: setting_name.to_string() },
    )])
    .await?;

    Ok(())
}

pub async fn waitlist_state(app: &Application, event: &str) -> Result<(), SSEError> {
    app.sse_client.submit(vec![Event::new_json(
        "waitlist",
        event,
        ""
    )])
    .await?;

    Ok(())
}
