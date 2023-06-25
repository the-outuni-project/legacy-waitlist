mod characters;

pub fn routes() -> Vec<rocket::Route> {
    [
        characters::routes(),
    ]
    .concat()
}
