const { readdirSync } = require("fs");

module.exports = (bot) => {
    const buttonFolders = readdirSync("./buttons");
    for (const folder of buttonFolders) {
        const buttonFiles = readdirSync(`./buttons/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of buttonFiles) {
            const pull = require(`../buttons/${folder}/${file}`);
            bot.buttons.set(pull?.config?.name || file.split('.')[0], pull);
        }
    }
};