use eve_data_core::TypeID;
use rocket::serde::json::Json;
use serde::Serialize;

use crate::core::auth::AuthenticatedAccount;
use crate::data;
use crate::util::types::WaitlistCategory;

#[derive(Debug, Serialize)]
struct CategoryResponse {
    categories: &'static Vec<WaitlistCategory>,
}

#[get("/api/categories")]
fn categories(_account: AuthenticatedAccount) -> Json<CategoryResponse> {
    Json(CategoryResponse {
        categories: data::categories::categories(),
    })
}

#[get("/api/categories/rules")]
fn category_rules(_account: AuthenticatedAccount) -> Json<&'static Vec<(TypeID, String)>> {
    Json(data::categories::rules())
}

pub fn routes() -> Vec<rocket::Route> {
    routes![categories, category_rules]
}
