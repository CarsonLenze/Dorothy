const { colorify } = require("../../resources/functions.js");

module.exports = async (bot) => {
    await bot.application.fetch();

    let localCommands = [];
    bot.commands.forEach(exported => {
      if (exported.command) localCommands.push(exported.command);
    });

    let commands = await bot.application?.commands?.fetch();
    for (var i = 0; i < localCommands.length; i++) {
        let command = commands.find((t) => t.name == localCommands[i].name);

        if (!command?.equals(localCommands[i]) || localCommands.length != commands.size) {
            bot.application?.commands?.set(localCommands).then(() => {
                console.log(`${colorify("INFO", "bright yellow")} | Updated slash commands (ready.js)`);
            });
            break;
        }
    }

    let state = 0
    setInterval(() => {
        const presences = [
            { name: 'you', type: 'WATCHING' },
            { name: 'ecpehub.net', type: 'PLAYING' },
            { name: `over ${bot.guilds.cache.size} server(s)`, type: 'WATCHING' },
            { name: `${(bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)).toLocaleString()} user(s)`, type: 'LISTENING' }
        ];
        state = (state + 1) % presences.length;
        let presence = presences[state];

        bot.user.setPresence({ activities: [presence], status: 'dnd' });
    }, 15000);

    console.log(`${colorify('ONLINE', 'bright green')} | ${bot.user.tag} is now online in ${bot.guilds.cache.size} guild(s)!`);
};