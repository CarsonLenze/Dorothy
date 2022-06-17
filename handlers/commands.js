const { readdirSync } = require("fs");

module.exports = (bot) => {
    const commandFolders = readdirSync("./commands");
    for (const folder of commandFolders) {
        const commandFiles = readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const pull = require(`../commands/${folder}/${file}`);
            bot.commands.set(pull?.config?.name || file.split('.')[0], pull);
        }
    }
};