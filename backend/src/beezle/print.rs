use colored::Colorize;

pub fn print(content: &str) {
    println!("{} {}", "[BEEZLE-SERVER]".bright_green(), content);
}
