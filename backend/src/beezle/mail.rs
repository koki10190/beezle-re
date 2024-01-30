use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use std::env;

pub async fn send_html(to_mail: &str, subject: &str, html: &str) {
    let message = MessageBuilder::new()
        .from((
            "Beezle".to_string(),
            env::var("GMAIL_MAIL").unwrap().to_string(),
        ))
        .to(vec![to_mail])
        .subject(subject)
        .html_body(html);

    SmtpClientBuilder::new("smtp.gmail.com", 587)
        .implicit_tls(false)
        .credentials(Credentials::new(
            env::var("GMAIL_MAIL").unwrap().as_str(),
            env::var("GMAIL_MAIL_PASSWORD").unwrap().as_str(),
        ))
        .connect()
        .await
        .unwrap()
        .send(message)
        .await
        .unwrap();
}

pub async fn send(to_mail: &str, subject: &str, text: &str) {
    let message = MessageBuilder::new()
        .from((
            "Beezle".to_string(),
            env::var("GMAIL_MAIL").unwrap().to_string(),
        ))
        .to(vec![("Receiver", to_mail)])
        .subject(subject)
        .text_body(text);

    SmtpClientBuilder::new("smtp.gmail.com", 587)
        .implicit_tls(false)
        .credentials(Credentials::new(
            env::var("GMAIL_MAIL").unwrap().as_str(),
            env::var("GMAIL_MAIL_PASSWORD").unwrap().as_str(),
        ))
        .connect()
        .await
        .unwrap()
        .send(message)
        .await
        .unwrap();
}
