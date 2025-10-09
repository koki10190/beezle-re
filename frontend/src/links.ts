const github = "https://github.com/koki10190/beezle-re";
const discord = "https://discord.gg/GNRwq9ruQb";
const twitter = "https://twitter.com/beezle_lol";
const youtube = "https://www.youtube.com/@koki10190";

const production_mode = true;
const api_uri = !production_mode ? "https://server.beezle.lol:3000" : "http://localhost:3000";
const ws_uri = production_mode ? "wss://server.beezle.lol:3000/ws" : "ws://localhost:3000/ws";
const dm_uri = !production_mode ? "https://server.beezle.lol" : "https://localhost";
const server_uri = production_mode ? "server.beezle.lol" : "localhost";
// const api_uri = production_mode ? "https://ample-bunny-thoroughly.ngrok-free.app" : "http://localhost:3000";
// const ws_uri = production_mode ? "wss://ample-bunny-thoroughly.ngrok-free.app/ws" : "ws://localhost:3000/ws";
//ample-bunny-thoroughly.ngrok-free.app/
const tenor_api_key = "AIzaSyDlDh8g6uyw8HA3vDSKCDWyYrSb2OxpbiE";

const callback_uri = production_mode ? "https://beezle.lol" : "http://localhost:3000";

const discord_auth_uri = !production_mode
    ? "https://discord.com/oauth2/authorize?client_id=1394052663494049802&response_type=code&redirect_uri=http%3A%2F%2Flocalhost:3000%3A5173%2Fdiscord_auth&scope=identify"
    : "https://discord.com/oauth2/authorize?client_id=1394052663494049802&response_type=code&redirect_uri=https%3A%2F%2Fbeezle.lol%2Fdiscord_auth&scope=identify";

export { github, discord, twitter, youtube, api_uri, tenor_api_key, ws_uri, discord_auth_uri, callback_uri, dm_uri, server_uri };
