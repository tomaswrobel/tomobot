import {version} from "./package.json";
import {config} from "dotenv";
import Bot from "./src/Bot";

config();
console.log("Starting bot...");
new Bot().on("ready", client => {
    console.log(`${client.user.username} v${version} ready!`);
})