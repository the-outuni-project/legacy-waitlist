mod approve;
mod empty;
mod invite;
mod list;
mod notify;
mod remove;
mod xup;

pub fn routes() -> Vec<rocket::Route> {
    [
        list::routes(),
        approve::routes(),
        empty::routes(),
        remove::routes(),
        invite::routes(),
        xup::routes(),
    ]
    .concat()
}
