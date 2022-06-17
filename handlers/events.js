const { readdirSync } = require("fs");

module.exports = (bot) => {
    const eventFolders = readdirSync("./events");
    for (const folder of eventFolders) {
        const eventFiles = readdirSync(`./events/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(`../events/${folder}/${file}`);
            bot.on(file.split('.')[0], event.bind(null, bot));
        }
    }
};