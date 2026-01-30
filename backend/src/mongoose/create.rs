extern crate mongodb;
use mongodb::Client;

pub async fn create_collection(client: &Client, db_name: &str, coll_name: &str) {
    let db = client.database(db_name);
    let _ = db.create_collection(coll_name, None).await;
}
