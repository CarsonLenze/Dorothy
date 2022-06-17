const DESIGN = require("../../resources/design.json");
const { writeFileSync, readFileSync } = require("fs");
const { MessageEmbed } = require("discord.js");
const mysql = require('mysql');
const util = require('util');

module.exports = {
    command: {
        name: "blacklist",
        type: 2,
    },
    config: {
        cooldown: 10,
        locked: true
    },
    run: async (interaction) => {
        const user = interaction.client.users.cache.get(interaction.targetId),
            owner = interaction.client.application.owner,
            developers = owner.ownerId ? owner.members.map(member => member.user.id) : [owner.id];

        if (user.bot) {
            const error = new MessageEmbed()
                .addField(`${DESIGN.redx} Bot User`, `You can not blacklist a bot.`)
                .setColor(DESIGN.red);

            return interaction.reply({ embeds: [error], ephemeral: true });
        }

        if (developers.includes(user.id)) {
            const error = new MessageEmbed()
                .addField(`${DESIGN.redx} Developer`, `You can not blacklist a developer.`)
                .setColor(DESIGN.red);

            return interaction.reply({ embeds: [error], ephemeral: true });
        }

        const cache = JSON.parse(readFileSync("resources/cache.json")).blacklists,
            blacklists = cache.map(data => data.UserID),
            blacklisted = blacklists.includes(interaction.targetId);
        const dorothy = mysql.createConnection(`${process.env.MYSQL_URI}/Dorothy`);
        dorothy.query = util.promisify(dorothy.query).bind(dorothy);

        if (blacklisted) {
            let index = cache.findIndex(obj => obj.UserID == user.id);
            cache.splice(index, 1);
            await dorothy.query(`DELETE FROM Blacklists WHERE UserID = '${user.id}'`);
        } else {
            cache.push({ UserID: user.id, DeveloperID: interaction.user.id, Timestamp: Date.now() });
            await dorothy.query(`INSERT INTO Blacklists (UserID, DeveloperID, Timestamp) VALUES ('${user.id}', '${interaction.user.id}', ${Date.now()})`);
        }
        dorothy.end();

        const embed = new MessageEmbed()
            .addField(blacklisted ? `${DESIGN.check} UnBlacklisted` : `${DESIGN.redx} Blacklisted`, `<@${user.id}> ${blacklisted ? 'has been brought into the light.' : 'was blacklisted from using commands.'}`)
            .setColor(blacklisted ? DESIGN.green : DESIGN.red);

        writeFileSync("resources/cache.json", JSON.stringify({ blacklists: cache }, 0, 4));
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};