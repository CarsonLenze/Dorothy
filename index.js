const { Client, Collection, Intents } = require("discord.js");
let bot = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { readdirSync } = require("fs");
require("dotenv").config();

const handlersFiles = readdirSync('./handlers');
for (const file of handlersFiles) {
    bot[file.split('.')[0]] = new Collection();
    require(`./handlers/${file}`)(bot);
}

bot.login(process.env.TOKEN);