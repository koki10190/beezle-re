extern crate bcrypt;
use bcrypt::{hash, verify, BcryptError, DEFAULT_COST};

pub fn hash_password(password: &str) -> String {
    hash(password, DEFAULT_COST).unwrap()
    // let valid = verify("hunter2", &hashed).unwrap();
}

pub fn verify_password_hash(value: &str, password_hash: &str) -> bool {
    verify(value, password_hash).unwrap()
    // let valid = verify("hunter2", &hashed).unwrap();
}
