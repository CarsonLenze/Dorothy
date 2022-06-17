const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const DESIGN = require("../../resources/design.json");
const axios = require("axios");

module.exports = {
    command: {
        name: "group",
        description: "Shows information about the faction or clan",
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
        },
        {
            type: "STRING",
            name: "faction",
            description: "Specify a Faction",
            required: true
        }]
    },
    config: {
        cooldown: 10
    },
    run: async (interaction, args) => {
        await interaction.deferReply({ ephemeral: true });
        const api = axios.create({ baseURL: process.env.API_URL, headers: { token: process.env.API_KEY } });

        let body, factions = args[0] == 'op_factions';
        for (let requests = 0; requests < 2; requests++) {

            const request = await api.get(`/groups/${args[0]}/${args[1]}/${factions ? 'info' : 'clan_data'}`).catch(() => { /* ERR */ });
            if (!request) {
                const error = new MessageEmbed()
                    .addField(`${DESIGN.redx} No Data Found`, `There was no data found for that faction or clan.`)
                    .setColor(DESIGN.red);

                return interaction.editReply({ embeds: [error] }).catch(() => { /* ERR */ });
            }

            body = request.data.body;
            const name = factions ? body.faction_info.Faction : body.clan.Name;
            if (args[1] == name) requests++
            else args[1] = name;
        }
        const data = body[factions ? 'faction_info' : 'clan'];

        const options = [];
        for (const member in data.Members) {
            data.Members[member].name = member;

            options.push({
                label: `${member}`,
                description: 'View this players data.',
                value: `player-${interaction.user.id}-${member}-${args[0]}`,
            });
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('player')
                    .setPlaceholder('Choose a player to view')
                    .addOptions(options),
            );

        const embed = new MessageEmbed()
            .setAuthor({ name: args[1] })
            .setDescription(`The data on **${args[0].split('_').map((s) => s == 'op' ? 'OP' : s[0].toUpperCase() + s.substring(1)).join(' ')}** was updated <t:${Math.floor(body.timestamp / 1000)}:R>. ${args[1]} is a faction with **${options.length}** member(s) and is lead by **${Object.values(data.Members).find(x => x.Rank.toLowerCase() == 'leader').name}**.`)
            .addField('Statistics', `<:sword:932081696239673375> Strength: ${(args[0] == 'op_factions' ? `**${(data.STR).toLocaleString()}**\n<:coin:932042628478959686> Value **${(data.SpawnerValue).toLocaleString()}**` : `**${(data.Power).toLocaleString()}**\n${args[0] == 'prisons' ? `<:potion:932085511030452305> Mana: **${(data.DepositedMana).toLocaleString()}**` : `<:coin:932042628478959686> Coins: **${(data.Funds).toLocaleString()}**`}`)}\n<:star:932042617292742707> Level: **${data.Level}**`, true)
            .setColor(DESIGN.green)
            .setTimestamp();

        if (args[0] == 'op_factions') {
            embed.addField('Assets', `<:coin:932042628478959686> Coins: **${(data.Money).toLocaleString()}**\n<:scroll:932085530382983218> Spawners: **${(data.SpawnerCount).toLocaleString()}**`, true);
        }

        if (args[0] != 'prisons') {
            function level(value) { return value == 5 ? '**Max**' : `**${value}**` };
            embed.addField('Perks', `<:coin:932042628478959686> Power Grind: ${level(body.perks ? body.perks.PowerGrindLevel : data.SaleBoost)}\n<:envelope:932838836009062420> Capacity: ${level(body.perks ? body.perks.CapacityLevel : data.Capacity)}\n${args[0] == 'op_factions' ? '<:potion:932085511030452305> CEEXP Grind: ' + level(body.perks.CustomGrindLevel) + '\n' : ''}${body.perks ? `<:flight:932836301265330176> Flight: **${body.perks.FactionFly ? 'Yes' : 'No'}**` : ''}`, true);
        }

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};