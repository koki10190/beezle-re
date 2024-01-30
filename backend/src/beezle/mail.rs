use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use std::env;

pub async fn send_html(to_mail: &str, subject: &str, html: &str) -> bool {
    let mail = env::var("GMAIL_MAIL").unwrap();
    let pass = env::var("GMAIL_MAIL_PASSWORD").unwrap();

    let message = MessageBuilder::new()
        .from(("Beezle".to_string(), mail.to_string()))
        .to(vec![("Receiver", to_mail)])
        .subject(subject)
        .html_body(html);

    let smtp = SmtpClientBuilder::new("smtp.gmail.com", 587)
        .implicit_tls(false)
        .credentials(Credentials::new(mail.as_str(), pass.as_str()));

    let smtp_connection = smtp.connect().await;

    match smtp_connection {
        Ok(_) => {
            let send_status = smtp_connection.unwrap().send(message).await;

            match send_status {
                Ok(_) => {
                    send_status.unwrap();
                    true
                }
                Err(_) => {
                    println!("BEEZLE-MAIL ERROR: Couldn't send message!");
                    false
                }
            }
        }
        Err(_) => {
            println!("BEEZLE-MAIL ERROR: Couldn't make a connection!");
            false
        }
    }
}

pub async fn send(to_mail: &str, subject: &str, text: &str) -> bool {
    let mail = env::var("GMAIL_MAIL").unwrap();
    let pass = env::var("GMAIL_MAIL_PASSWORD").unwrap();

    let message = MessageBuilder::new()
        .from(("Beezle".to_string(), mail.to_string()))
        .to(vec![("Receiver", to_mail)])
        .subject(subject)
        .text_body(text);

    let smtp = SmtpClientBuilder::new("smtp.gmail.com", 587)
        .implicit_tls(false)
        .credentials(Credentials::new(mail.as_str(), pass.as_str()));

    let smtp_connection = smtp.connect().await;

    match smtp_connection {
        Ok(_) => {
            let send_status = smtp_connection.unwrap().send(message).await;

            match send_status {
                Ok(_) => {
                    send_status.unwrap();
                    true
                }
                Err(_) => {
                    println!("BEEZLE-MAIL ERROR: Couldn't send message!");
                    false
                }
            }
        }
        Err(_) => {
            println!("BEEZLE-MAIL ERROR: Couldn't make a connection!");
            false
        }
    }
}
