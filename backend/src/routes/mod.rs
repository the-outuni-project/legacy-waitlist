mod announcements;
mod auth;
mod badges;
mod bans;
mod categories;
mod commanders;
mod fitcheck;
mod fittings;
mod fleet; // deprecated
mod fleets;
mod healthcheck;
mod history;
mod implants;
mod modules;
mod notes;
mod pilot;
mod search;
mod skillplans;
mod reports;
mod skills;
mod sse;
mod statistics;
mod waitlist;
mod window;

pub fn routes() -> Vec<rocket::Route> {
    [
        announcements::routes(),
        auth::routes(),
        sse::routes(),
        skills::routes(),
        pilot::routes(),
        history::routes(),
        window::routes(),
        badges::routes(),
        bans::routes(),
        commanders::routes(),
        modules::routes(),
        search::routes(),
        categories::routes(),
        fleet::routes(),
        fleets::routes(),
        waitlist::routes(),
        statistics::routes(),
        healthcheck::routes(),
        implants::routes(),
        notes::routes(),
        skillplans::routes(),
        fitcheck::routes(),
        fittings::routes(),
        reports::routes()
    ]
    .concat()
}
