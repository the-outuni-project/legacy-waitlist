mod actions;
mod configure;
mod settings;

pub fn routes() -> Vec<rocket::Route> {
    [
        actions::routes(),
        configure::routes(),
        settings::routes(),
    ]
    .concat()
}
