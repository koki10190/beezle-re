pub mod insert;
pub use insert::insert_document;

pub mod create;
pub use create::create_collection;

pub mod get;
pub use get::get_count;
pub use get::get_document;

pub mod delete;
pub use delete::delete_document;
pub use delete::delete_many_document;

pub mod update;
pub use update::update_document;

pub mod structures;

pub mod get_many;
pub use get_many::get_many_document;

pub mod xp;
pub use xp::add_xp;

pub mod coins;
pub use coins::add_coins;
pub use coins::get_coins;

pub mod milestones;

pub mod hives;