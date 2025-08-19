extern crate mongodb;
use bson::{doc, Bson};
use mongodb::bson::Document;
use mongodb::Client;

use crate::{beezle::{self, ws_send_notification}, mongoose::structures::User};

use super::{get_document, structures::user::UserLevels, update_document};

pub enum MilestoneEnum {
    Likes10,
    Likes100,
    Likes1000,
    Likes10000,

    // Follows
    Follows10,
    Follows100,
    Follows1000,
    Follows10000,

    // Reposts
    Reposts10,
    Reposts100,
    Reposts1000,
    Reposts10000,
}

pub struct Milestone { 
    name: &'static str,
    requirement: &'static str,
    requirement_need: i64, 
    icon: &'static str,
    color: &'static str,
    description: &'static str,
}


pub const MILESTONES: [Milestone; 12] = [
    Milestone {
        name: "10 Likes",
        requirement: "likes",
        requirement_need: 10,
        icon: "fa-solid fa-square-heart",
        color: "white",
        description: "Get 10 likes on one of your posts!",
    },
    Milestone {
        name: "100 Likes",
        requirement: "likes",
        requirement_need: 100,
        icon: "fa-solid fa-square-heart",
        color: "rgb(255, 174, 0)",
        description: "Get 100 likes on one of your posts!",
    },
    Milestone {
        name: "1k Likes",
        requirement: "likes",
        requirement_need: 1000,
        icon: "fa-solid fa-star",
        color: "rgb(255, 55, 55)",
        description: "Get 1,000 likes on one of your posts!",
    },
    Milestone {
        name: "10k Likes",
        requirement: "likes",
        requirement_need: 10000,
        icon: "fa-solid fa-star",
        color: "rgb(70, 119, 255)",
        description: "Get 10,000 likes on one of your posts!",
    },

    // FOLLOWS
    Milestone {
        name: "10 Followers",
        requirement: "follows",
        requirement_need: 10,
        icon: "fa-solid fa-award",
        color: "white",
        description: "Get 10 people to follow your account!",
    },
    Milestone {
        name: "100 Followers",
        requirement: "follows",
        requirement_need: 100,
        icon: "fa-solid fa-award-simple",
        color: "rgb(255, 174, 0)",
        description: "Get 100 people to follow your account!",
    },
    Milestone {
        name: "1k Followers",
        requirement: "follows",
        requirement_need: 1000,
        icon: "fa-solid fa-medal",
        color: "rgb(255, 55, 55)",
        description: "Get 1,000 people to follow your account!",
    },
    Milestone {
        name: "10k Followers",
        requirement: "follows",
        requirement_need: 10000,
        icon: "fa-solid fa-crown",
        color: "rgb(70, 119, 255)",
        description: "Get 10,000 people to follow your account!",
    },

    // REPOSTS
    Milestone {
        name: "10 Reposts",
        requirement: "reposts",
        requirement_need: 10,
        icon: "fa-solid fa-repeat",
        color: "white",
        description: "Get 10 reposts on one of your posts!",
    },
    Milestone {
        name: "100 Reposts",
        requirement: "reposts",
        requirement_need: 10,
        icon: "fa-solid fa-medal",
        color: "rgb(255, 174, 0)",
        description: "Get 100 reposts on one of your posts!",
    },
    Milestone {
        name: "1k Reposts",
        requirement: "reposts",
        requirement_need: 1000,
        icon: "fa-solid fa-trophy",
        color: "rgb(255, 55, 55)",
        description: "Get 1,000 reposts on one of your posts!",
    },
    Milestone {
        name: "10k Reposts",
        requirement: "reposts",
        requirement_need: 10000,
        icon: "fa-solid fa-trophy-star",
        color: "rgb(70, 119, 255)",
        description: "Get 10,000 reposts on one of your posts!",
    },
];

pub enum NotifType {
    None,
    Post,
    Handle,
    Milestone,
}

pub async fn milestone_unlocked(client: &Client, milestone: MilestoneEnum, handle: &str) {
    let ms: i64 = milestone as i64;
    update_document(
        &client,
        "beezle",
        "Users",
        doc! {
            "handle": &handle
        },
        doc! {
            "$addToSet": {
                "notifications": {
                    "caller": "Beezle Server",
                    "notif_type": NotifType::Milestone as i64,
                    "milestone": ms,
                    "message": format!("Congratulations! You've achieved \"{}\" milestone!", MILESTONES[ms as usize].name)
                }
            }
        },
    )
    .await;
}

pub async fn check_like_milestone(client: &Client, handle: &str, post_like_count: i64) {
    let document = get_document(client, "beezle", "Users", doc!{"handle": handle}).await.unwrap();
    let user: User = bson::from_bson(bson::Bson::Document(document.clone())).unwrap();
    let mut milestones: Vec<i64> = [].to_vec(); 

    match document.get("milestones") {
        Some(doc) => {
            match doc.as_array() {
                Some(arr) => {
                    for milestone in arr  {
                        let ms = milestone.as_i64().unwrap_or(-1);
                        milestones.push(ms);
                    }
                },
                None => {},
            }
        },
        None => {
        },
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Likes10 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Likes10 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Likes10 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Likes10, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Likes100 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Likes100 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Likes100 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Likes100, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Likes1000 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Likes1000 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Likes1000 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Likes1000, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Likes10000 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Likes10000 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Likes10000 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Likes10000, handle).await;
    }
}

pub async fn check_repost_milestone(client: &Client, handle: &str, post_like_count: i64) {
    let document = get_document(client, "beezle", "Users", doc!{"handle": handle}).await.unwrap();
    let user: User = bson::from_bson(bson::Bson::Document(document.clone())).unwrap();
    let mut milestones: Vec<i64> = [].to_vec(); 

    match document.get("milestones") {
        Some(doc) => {
            match doc.as_array() {
                Some(arr) => {
                    for milestone in arr  {
                        let ms = milestone.as_i64().unwrap_or(-1);
                        milestones.push(ms);
                    }
                },
                None => {},
            }
        },
        None => {
        },
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Reposts10 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Reposts10 as i64).is_some(){
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Reposts10 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Reposts10, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Reposts100 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Reposts100 as i64).is_some(){
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Reposts100 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Reposts100, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Reposts1000 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Reposts1000 as i64).is_some(){
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Reposts1000 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Reposts1000, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Reposts10000 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Reposts10000 as i64).is_some(){
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Reposts10000 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Reposts10000, handle).await;
    }
}

pub async fn check_follow_milestone(client: &Client, handle: &str, post_like_count: i64) {
    let document = get_document(client, "beezle", "Users", doc!{"handle": handle}).await.unwrap();
    let user: User = bson::from_bson(bson::Bson::Document(document.clone())).unwrap();
    let mut milestones: Vec<i64> = [].to_vec(); 

    match document.get("milestones") {
        Some(doc) => {
            match doc.as_array() {
                Some(arr) => {
                    for milestone in arr  {
                        let ms = milestone.as_i64().unwrap_or(-1);
                        milestones.push(ms);
                    }
                },
                None => {},
            }
        },
        None => {
        },
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Follows10 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Follows10 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Follows10 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Follows10, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Follows100 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Follows100 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Follows100 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Follows100, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Follows1000 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Follows1000 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Follows1000 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Follows1000, handle).await;
    }

    if post_like_count >= MILESTONES[MilestoneEnum::Follows10000 as usize].requirement_need && milestones.iter().find(|x| **x == MilestoneEnum::Follows10000 as i64).is_none() {
        update_document(client, "beezle", "Users", doc!{"handle": &user.handle}, doc!{
            "$push": {
                "milestones": MilestoneEnum::Follows10000 as i64
            }
        }).await;
        milestone_unlocked(client, MilestoneEnum::Follows10000, handle).await;
    }
}