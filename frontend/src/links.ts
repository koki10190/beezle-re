const github = "https://github.com/koki10190/beezle-re";
const discord = "https://discord.gg/GNRwq9ruQb";
const twitter = "https://twitter.com/beezle_lol";
const youtube = "https://www.youtube.com/@koki10190";

const production_mode = false;

const api_uri = production_mode ? "https://server.beezle.lol:3000" : "http://localhost:3000";
const ws_uri = production_mode ? "wss://server.beezle.lol:3000/ws" : "ws://localhost:3000/ws";
// const api_uri = production_mode ? "https://ample-bunny-thoroughly.ngrok-free.app" : "http://localhost:3000";
// const ws_uri = production_mode ? "wss://ample-bunny-thoroughly.ngrok-free.app/ws" : "ws://localhost:3000/ws";
//ample-bunny-thoroughly.ngrok-free.app/
const tenor_api_key = "AIzaSyDlDh8g6uyw8HA3vDSKCDWyYrSb2OxpbiE";

export { github, discord, twitter, youtube, api_uri, tenor_api_key, ws_uri };
