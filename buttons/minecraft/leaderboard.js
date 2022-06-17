const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const DESIGN = require("../../resources/design.json");
const axios = require("axios");

module.exports = {
    config: {
        cooldown: 2
    },
    run: async (button, args) => {
        if (button.user.id != args[0]) return button.deferUpdate();

        let data = button.client.cache.get(args[1]);
        if (!data || button.componentType == 'SELECT_MENU') {
            const request = await axios.get(`${process.env.API_URL}/leaderboards/${args[1]}`, { headers: { token: process.env.API_KEY } })

            if (!request) {
                const error = new MessageEmbed()
                    .addField(`${DESIGN.redx} No Data`, `There is currently nothing in this leaderboard, try again in the future.`)
                    .setColor(DESIGN.red);

                return button.reply({ embeds: [error], ephemeral: true });
            }
            data = Object.values(request.data.body)[1];
            button.client.cache.set(args[1], data);
        }

        let totalPages = Math.ceil(data.length / 10), type = args[1].split('/'), page = 1, leaderboard;
        page = parseInt(args[2]);
        if (args[2] > totalPages) page = totalPages;
        if (args[2] < 1) page = 1;
        leaderboard = data.slice((page * 10) - 10, page * 10);

        let string = '';
        for (let i = 0; i < leaderboard.length; i++) {
            const object = Object.entries(leaderboard[i]).flat(),
                index = data.indexOf(leaderboard[i]);
            let place = DESIGN.leaderboards[index];
            if (!place) place = `${index + 1}.`

            const result = DESIGN.changes.find(data => Object.keys(data)[0] == object[2]);
            if (result) object[2] = result[object[2]];

            const value = `${object[3].toLocaleString()} ${DESIGN.exclusions.includes(object[2]) || result ? object[2] : 'Coins'}`;
            string = `${string}${place} ${object[1]}: **${object[2] == 'Level' ? value.split(' ').reverse().join(' ') : value}**\n`;
        }

        const embed = new MessageEmbed()
            .setTitle(`${type[0].split('_').map((s) => s == 'op' ? 'OP' : s[0].toUpperCase() + s.substring(1)).join(' ')} | ${type[1][0].toUpperCase() + type[1].substring(1).toLowerCase()} ${type[2].split('_').map((s) => s[0].toUpperCase() + s.substring(1)).join(' ')} Leaderboard`)
            .setDescription(string)
            .setFooter({ text: `Page ${page}/${totalPages}`, iconURL: button.guild.iconURL() })
            .setColor(DESIGN.green)
            .setTimestamp();

        const row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setCustomId(`leaderboard-${button.user.id}-${args[1]}-${page - 10}`)
                    .setEmoji('933166514188734464')
                    .setStyle('PRIMARY')
                    .setDisabled(page - 10 < 1),
                new MessageButton()
                    .setCustomId(`leaderboard-${button.user.id}-${args[1]}-${page - 1}`)
                    .setEmoji('933166468588240946')
                    .setStyle('PRIMARY')
                    .setDisabled(page - 1 < 1),
                new MessageButton()
                    .setCustomId(`leaderboard-${button.user.id}-${args[1]}-${page + 1}`)
                    .setEmoji('933166468605030480')
                    .setStyle('PRIMARY')
                    .setDisabled(page + 1 > totalPages),
                new MessageButton()
                    .setCustomId(`leaderboard-${button.user.id}-${args[1]}-${page + 10}`)
                    .setEmoji('933166527170093107')
                    .setStyle('PRIMARY')
                    .setDisabled(page + 10 > totalPages)
            ]);

        if (button.componentType == 'SELECT_MENU') return button.reply({ embeds: [embed], components: [row] });
        button.update({ embeds: [embed], components: [row] });
    },
};