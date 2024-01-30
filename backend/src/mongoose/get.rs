extern crate mongodb;
use mongodb::bson::Document;
use mongodb::Client;

pub async fn get_document(
    client: &Client,
    db_name: &str,
    coll_name: &str,
    filter: Document,
) -> Option<Document> {
    let db = client.database(db_name);
    let coll: mongodb::Collection<Document> = db.collection(coll_name);

    let result = coll.find_one(Some(filter), None).await;
    match result {
        Ok(doc) => doc,
        Ok(None) => None,
        Err(_) => None,
    }
}
