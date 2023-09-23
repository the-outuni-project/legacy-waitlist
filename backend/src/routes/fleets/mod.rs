mod actions;
mod configure;
mod comp;
mod notify;
mod settings;

pub fn routes() -> Vec<rocket::Route> {
    [
        actions::routes(),
        configure::routes(),
        comp::routes(),
        settings::routes(),
    ]
    .concat()
}
