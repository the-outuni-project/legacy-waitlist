mod configure;
mod settings;

pub fn routes() -> Vec<rocket::Route> {
    [
        configure::routes(),
        settings::routes(),
    ]
    .concat()
}
