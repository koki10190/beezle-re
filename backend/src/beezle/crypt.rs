extern crate bcrypt;
use core::str;

use ::base64::engine::general_purpose;
use ::base64::Engine;
use bcrypt::{hash, verify, BcryptError, DEFAULT_COST};
use aes_gcm::aead::Aead;
use aes_gcm::{AeadCore, Aes256Gcm, Key, KeyInit};
use openssl::base64;
use rand::rngs::OsRng;

use crate::beezle;

pub struct CryptBlock {
    nonce: Vec<u8>,
    data: String
}

pub fn hash_password(password: &str) -> String {
    hash(password, DEFAULT_COST).unwrap()
    // let valid = verify("hunter2", &hashed).unwrap();
}

pub fn verify_password_hash(value: &str, password_hash: &str) -> bool {
    verify(value, password_hash).unwrap()
    // let valid = verify("hunter2", &hashed).unwrap();
}

pub fn encrypt(data: &str, pass: &str) -> Result<Vec<u8>, anyhow::Error> {
    let data = simple_crypt::encrypt(data.as_bytes(), pass.as_bytes());
    data
}

pub fn decrypt(encryption: &str, pass: &str) -> Result<Vec<u8>, anyhow::Error> {
    let decoded_base64 = general_purpose::STANDARD.decode(encryption);

    match decoded_base64 {
        Ok(decoded_encryption) => {
    
            let decoded = simple_crypt::decrypt(&decoded_encryption, pass.as_bytes());
            decoded
        }
        Err(err) => {
            let decoded = simple_crypt::decrypt(&encryption.as_bytes(), pass.as_bytes());
            decoded
        }
    }

}

pub fn base64_encode(data: Vec<u8>) -> String {
    general_purpose::STANDARD.encode(data)
}


pub fn base64_decode(data: String) -> Vec<u8> {
    general_purpose::STANDARD.decode(data).unwrap()
}

// pub fn encrypt(data: &str, pass: &str) -> CryptBlock {
//     let password = pass.as_bytes();
//     let key: &Key<Aes256Gcm> = password.into();
//     let cipher = Aes256Gcm::new(&key);
//     let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    
//     match cipher.encrypt(&nonce, data.as_bytes()) {
//         Ok(encrypted) => {
//             let e = CryptBlock { data: base64::encode_block(&encrypted), nonce: nonce.to_vec() };
//             e
//         }
//         Err(err) => {
//             let vec: Vec<u8> = vec![];
//             let e = CryptBlock { data: "".to_string(), nonce: vec  };
//             e
//         }
//     }
// }
// pub fn decrypt(block: &CryptBlock, password:&str) -> String {
//     let password_byte = password.as_bytes();
//     let key: &Key<Aes256Gcm> = password_byte.into();
//     let nonce = &block.nonce;
//     let data = &block.data;
//     let decoded = base64::decode_block(data).unwrap().to_vec();

//     let nonce = aes_gcm::Nonce::from_slice(&nonce);

//     let cipher = Aes256Gcm::new(&key);
//     let op = cipher.decrypt(&nonce , &*decoded);

//     match op  {
//         Ok(decrypted) => {
//             let _string = str::from_utf8(&decrypted).unwrap();
//             beezle::print(_string);
//             _string.to_string()
//         }
//         Err(err) => {
//             "".to_string()
//         }
//     }
//     //  let plaintext = cipher.decrypt(nonce, &*encryptedTex[15..].as_ref()).unwrap();
// }