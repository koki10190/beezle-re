pub mod insert;
pub use insert::insert_document;

pub mod create;
pub use create::create_collection;

pub mod get;
pub use get::get_document;

pub mod delete;
pub use delete::delete_document;

pub mod update;
pub use update::update_document;

pub mod structures;
