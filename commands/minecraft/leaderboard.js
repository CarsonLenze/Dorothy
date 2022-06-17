const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const DESIGN = require("../../resources/design.json");

module.exports = {
    command: {
        name: "leaderboard",
        description: "Select a leaderboard to view",
        options: [{
            type: "STRING",
            name: "server",
            description: "Specify a server",
            required: true,
            choices: [
                { name: "OP Factions", value: "op_factions" },
                { name: "Skyblock", value: "skyblock" },
                { name: "Prisons", value: "prisons" }
            ]
        }]
    },
    config: {
        cooldown: 10
    },
    run: async (interaction, args) => {
        const leaderboards = {
            op_factions: {
                factions: ["strength", "value", "level", "spawners"],
                players: ["money", "ceexp", "boss_damage", "boss_kills", "kills", "deaths", "mob_coins"],
            },
            skyblock: {
                clans: ["power", "funds", "level"],
                players: ["money", "kills", "deaths", "holo_coins", "cxp", "orbs", "player_level"],
            },
            prisons: {
                clans: ["power", "mana_balance", "level"],
                players: ["money", "kills", "deaths", "bounty", "mana", "blocks_broken", "prestige"],
            }
        }

        const server = leaderboards[args[0]], options = [];
        for (const type in server) {
            for (const choice of server[type]) {
                const leaderboard = choice.split('_').map((s) => s.includes('xp') ? s.toUpperCase() : s[0].toUpperCase() + s.substring(1)).join(' ');

                options.push({
                    label: `${type[0].toUpperCase() + type.substring(1)} • ${leaderboard}`,
                    description: `Click this option to view the ${leaderboard} leaderboard`,
                    value: `leaderboard-${interaction.user.id}-${args[0]}/${type}/${choice}-1`,
                    emoji: Object.keys(server)[0] == type ? '👥' : '👤',
                });
            }
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('leaderboard')
                    .setPlaceholder('Choose a leaderboard to view')
                    .addOptions(options),
            );

        const embeds = new MessageEmbed()
            .setTitle(`${DESIGN.loading} Make a Selection`)
            .setDescription(`Please use the dropdown below to select a leaderboard from **${args[0].split('_').map((s) => s == 'op' ? 'OP' : s[0].toUpperCase() + s.substring(1)).join(' ')}**`)
            .setColor(DESIGN.green);

        await interaction.reply({ embeds: [embeds], components: [row], ephemeral: true });
    },
};