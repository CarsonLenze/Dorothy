const { query } = require("../../resources/functions.js");
const DESIGN = require("../../resources/design.json");
const { MessageEmbed } = require('discord.js');

module.exports = {
    command: {
        name: "list",
        description: "do this later",
        options: [{
            type: "STRING",
            name: "server",
            description: "Specify a server",
            required: false,
            choices: [
                { name: "OP Factions", value: "op_factions" },
                { name: "Skyblock", value: "skyblock" },
                { name: "Call of Duty", value: "cod" },
                { name: "Prisons", value: "prisons" }
            ]
        }]
    },
    config: {
        cooldown: 10
    },
    run: async (interaction, args) => {
        await interaction.deferReply();

        if (!args) {
            let playerCount = 0, servers = ['op_factions', 'skyblock', 'cod', 'prisons', 'hub'];
            for (const server of servers) {
                let data = await query(server.toUpperCase()).catch(() => { /* ERR */ });
                playerCount += parseInt(data?.currentPlayers || 0);
            }

            const embed = new MessageEmbed()
                .setDescription(`There are currently **${playerCount}** players online across all of ecpe network\n\nTo get the player list for a specific server, run \`\`/list server: (server)\`\`!`)
                .setColor(DESIGN.green)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        const data = await query(args[0].toUpperCase()).catch(() => { /* ERR */ });
        if (!data) {
            const embed = new MessageEmbed()
                .addField(`${DESIGN.redx} Unreachable Server`, `The server we were trying to reach may be offline.`)
                .setColor(DESIGN.red)

            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new MessageEmbed()
            .setDescription(`There are currently **${data.currentPlayers}** players online on \`\`${args[0].split('_').map((s) => DESIGN.names[s] || s[0].toUpperCase() + s.substring(1)).join(' ')}\`\``)
            .addField('Information', `${data.whitelist ? DESIGN.check : DESIGN.redx} Whitelisted\n:stopwatch: Ping: **${data.ping}ms**\n:information_source: Version: **${data.version || 'v1.19.10'}**`, true)
            .setColor(DESIGN.green)
            .setTimestamp();

        if (data.players[0]) {
            let string = ''
            for (var i = 0; i < data.players.length; i++) {
                string = string + data.players[i] + ', '
                if (string.length >= 1000) {
                    embed.addField(embed.fields.length > 1 ? '\u200B' : 'Online Players', `\`\`\`${string.slice(0, -2)}\`\`\``);
                    string = ''
                }
            }
            if (string) embed.addField(embed.fields.length > 1 ? '\u200B' : 'Online Players', `\`\`\`${string.slice(0, -2)}\`\`\``);
        } else {
            embed.addField('Online Players', `\`\`\`There is no one online.\`\`\``);
        }

        return interaction.editReply({ embeds: [embed] });
    },
};