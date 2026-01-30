extern crate mongodb;
use mongodb::bson::Document;
use mongodb::Client;

pub async fn update_document(
    client: &Client,
    db_name: &str,
    coll_name: &str,
    filter: Document,
    update: Document,
) {
    let db = client.database(db_name);
    let coll: mongodb::Collection<Document> = db.collection(coll_name);

    coll.update_one(filter, update, None).await.unwrap();
}
