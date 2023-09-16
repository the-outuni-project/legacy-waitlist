#[derive(Debug)]
pub struct Wing {
    pub name: String,
    pub squads: Vec<String>
}

pub async fn load_default_squads()
 -> Vec<Wing> {
    let mut wings = Vec::new();

    let on_grid_squads = vec![
        "Logistics".to_string(),
        "Bastion".to_string(),
        "CQC/Sniper".to_string(),
        "Alts".to_string()
    ];

    wings.push(Wing {
        name: "On Grid".to_string(),
        squads: on_grid_squads
    });


    let off_grid_squads = vec![
        "Scout 1".to_string(),
        "Scout 2".to_string(),
        "Other".to_string()
    ];

    wings.push(Wing {
        name: "Off Grid".to_string(),
        squads: off_grid_squads
    });

    wings
}
