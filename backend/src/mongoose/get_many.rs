extern crate mongodb;
use bson::doc;
use futures::{StreamExt, TryStreamExt};
use mongodb::bson::Document;
use mongodb::{Client, Cursor};
use rand::Rng;

use crate::beezle;

pub fn vec_to_str(vec: &Vec<Document>) -> String {
    let mut arr_str = "[".to_string();

    for i in vec.iter() {
        arr_str += &i.to_string();
        arr_str += ",";
    }
    arr_str.pop();
    arr_str += "]";

    arr_str
}

pub async fn get_many_document(
    client: &Client,
    db_name: &str,
    coll_name: &str,
    filter: Document,
) -> Vec<Document> {
    let db = client.database(db_name);
    let coll: mongodb::Collection<Document> = db.collection(coll_name);

    let mut cursor = coll.find(Some(filter), None).await.unwrap();

    cursor.try_collect().await.unwrap()
}

pub async fn get_many_random_document(
    client: &Client,
    db_name: &str,
    coll_name: &str,
    filter: Document,
) -> Vec<Document> {
    let db = client.database(db_name);
    let coll: mongodb::Collection<Document> = db.collection(coll_name);
    let mut rng = rand::thread_rng();

    let collection_size = coll.count_documents(doc! {}, None).await.unwrap();

    let mut cursor = coll
        .aggregate(
            vec![doc! {
                "$sample": {"size": collection_size as u32}
            }],
            None,
        )
        .await
        .unwrap();

    cursor.try_collect().await.unwrap()
}
