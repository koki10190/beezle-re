extern crate mongodb;
use mongodb::bson::Document;
use mongodb::Client;

pub async fn insert_document(client: &Client, db_name: &str, coll_name: &str, doc: Document) {
    let db = client.database(db_name);
    let coll = db.collection(coll_name);

    coll.insert_one(doc, None).await.unwrap();
}
