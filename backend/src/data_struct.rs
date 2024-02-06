use std::collections::HashMap;

pub struct AppData {
    pub client: mongodb::Client,
    pub connections: HashMap<String, actix_ws::Session>,
}
