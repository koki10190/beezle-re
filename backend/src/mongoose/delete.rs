extern crate mongodb;
use mongodb::bson::Document;
use mongodb::Client;

pub async fn delete_document(client: &Client, db_name: &str, coll_name: &str, filter: Document) {
    let db = client.database(db_name);
    let coll: mongodb::Collection<Document> = db.collection(coll_name);

    coll.delete_one(filter, None).await.unwrap();
}
