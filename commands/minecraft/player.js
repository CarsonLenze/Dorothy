const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { player } = require("../../resources/functions.js");
const DESIGN = require("../../resources/design.json");
const axios = require("axios");

module.exports = {
    command: {
        name: "player",
        description: "Shows information about the user",
        options: [{
                type: "STRING",
                name: "username",
                description: "View your player data or another's player data",
                required: true,
            }]
    },
    config: {
        cooldown: 10
    },
    run: async (interaction, args) => {
        await interaction.deferReply();
        const api = axios.create({ baseURL: process.env.API_URL, headers: { token: process.env.API_KEY } });

        interaction.player = await interaction.client.xbox.people.find(args[0], 1);
        interaction.player = interaction.player.people[0];
        if (!interaction.player) {
            const error = new MessageEmbed()
                .addField(`${DESIGN.redx} Invalid Username`, `**${args[0]}** has never played on ECPE servers, please make sure the username you typed is correct.`)
                .setColor(DESIGN.red);

            return interaction.editReply({ embeds: [error] });
        }

        const servers = ['op_factions', 'prisons'], query = new Object();
        for (const server of servers) {
            const request = await api.get(`/other/${server}/${interaction.player.xuid}/data`).catch(() => { /* ERR */ });
            if (request) query[server] = request.data.body;
        }

        const server = Object.keys(query)[0];
        if (!server) {
            const error = new MessageEmbed()
                .addField(`${DESIGN.redx} No Data Found`, `There was no data found for that user.`)
                .setColor(DESIGN.red);

            return interaction.editReply({ embeds: [error] });
        }

        const row = new MessageActionRow();
        for (const key of Object.keys(query)) {
            row.addComponents(
                new MessageButton()
                    .setCustomId(`player-${interaction.user.id}-${interaction.player.xuid}-${key}`)
                    .setLabel(key.split('_').map(s => s == 'op' ? 'OP' : s[0].toUpperCase() + s.substring(1)).join(' '))
                    .setStyle('SECONDARY')
                    .setDisabled(server == key)
            );
        }

        const data = query[server];
        switch (server) {
            case 'op_factions':
                combatdata = `<:skull_sword:932084764305932358> Boss Kills: **${data.player_info.BossKills}**\n<:target:932084779829055488> Boss Damage: **${(data.player_info.BossDamage).toLocaleString()}**`
                statdata = `<:small_potion:932043198115758162> CEEXP: **${(data.player_info.CEExp).toLocaleString()}**\n<:red_gem:932043266294181939> Mob Coins: **${(data.player_info.MobCoins).toLocaleString()}**`
                break;
            case 'skyblock':
                combatdata = `<:skull_sword:932084764305932358> Sword Kills: **${data.player_info.SwordKills}**\n<:hammer:932086230953365534> Axe Kills: **${data.player_info.AxeKills}**\n<:bow:932086230882082836> Bow Kills: **${data.player_info.BowKills}**`
                statdata = `<:trophy:932086230932402206> Score: **${(data.achievements.Points).toLocaleString()}**\n<:check:932080399558017055> Votes: **${(data.player_info.Votes).toLocaleString()}**`
                break;
            case 'prisons':
                combatdata = `<:scroll:932085530382983218> Bounty: **${(data.player_info.Bounty).toLocaleString()}**`
                statdata = `<:potion:932085511030452305> Mana: **${(data.player_info.Mana).toLocaleString()}**\n<:star:932042617292742707> Prestige: **${(data.player_info.Prestige).toLocaleString()}**\n<:pickaxe:932085510661357619> Blocks Broken: **${(data.player_info.BlocksBroken).toLocaleString()}**`
                break;
        }

        let keys = '', i = 0;
        for (const key in data.keys) {
            if (typeof data.keys[key] != 'number') continue;
            keys = `${keys}${DESIGN.keys[i++]} ${key}: **${data.keys[key]}** \n`;
        };

        const embed = new MessageEmbed()
            .setAuthor({ name: interaction.player.gamertag, iconURL: interaction.player.displayPicRaw })
            .setDescription(`The data on **${server.split('_').map((s) => s == 'op' ? 'OP' : s[0].toUpperCase() + s.substring(1)).join(' ')}** was last updated <t:${Math.floor(data.timestamp / 1000)}:R>. If you want to view your statistics on another server, use the buttons to navigate.`)
            .addFields(
                { name: 'Statistics', value: `<:banner:932042133282635856> ${server == 'op_factions' ? `Faction: **${data.player_info.Faction || 'None'}**` : `Clan: **${data.player_info.Clan || 'None'}**`}\n<:star:932042617292742707> ${server == 'prisons' ? `Mine: **${data.player_info.MineRank}**` : `Level: **${server == "op_factions" ? data.level.PlayerLevel : data.player_info.PlayerLevel}**`}\n<:coin:932042628478959686> Coins: **${(data.player_info.Money).toLocaleString()}**\n${statdata}`, inline: true },
                { name: 'Crate Keys', value: keys, inline: true },
                { name: 'Combat', value: `<:sword:932081696239673375> Kills: **${(data.player_info.Kills).toLocaleString()}**\n<:skull:932081696382283816> Deaths: **${(data.player_info.Deaths).toLocaleString()}**\n<:heart:932081696277405726> KDR: **${(data.player_info.Deaths ? data.player_info.Kills / data.player_info.Deaths : data.player_info.Kills).toFixed(2)}**\n${combatdata}`, inline: true }
            )
            .setColor(DESIGN.green)
            .setTimestamp();

        if (server == 'skyblock') {
            const permits = Object.entries(data.permits).reverse(),
                crops = Object.entries(data.permits_total).reverse(),
                animals = Object.entries(data.mobs).reverse();

            let index = crops.findIndex(val => val[1] > 0);
            if (index > 8) index = 8;

            const harvest = crops.map((v) => typeof v[1] == 'number' ? v[1] : 0),
                mobs = animals.map((v) => typeof v[1] == 'number' ? v[1] : 0),
                permit = permits[index - 1] ? permits[index - 1][0].split(/(?=[A-Z])/).join(' ') : 'Blue Iris';

            embed.addFields(
                { name: 'Currency', value: `<:potion:932085511030452305> CXP: **${data.player_info.CXP.toLocaleString()}**\n<:small_potion:932043198115758162> Orbs: **${data.player_info.Orbs.toLocaleString()}**\n<:purple_gem:932086876444176414> Holo Coins: **${data.player_info.HoloCoins.toLocaleString()}**`, inline: true },
                { name: 'Farming & Grinding', value: `<:lock:932087805876785153> Permit: **${permit}**\n<:sword:932081696239673375> Total Mobs: **${mobs.reduce((a, b) => a + b, 0).toLocaleString()}**\n<:clover:932087249271685170> Total Harvest: **${harvest.reduce((a, b) => a + b, 0).toLocaleString()}**\n<:bullet_point:932087645897641986> ${permit}: **${(crops[index][1]).toLocaleString()}**`, inline: true }
            );
        }

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};