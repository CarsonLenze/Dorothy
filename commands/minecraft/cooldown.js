const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const DESIGN = require("../../resources/design.json");
const mysql = require('mysql');
const axios = require("axios");
const util = require('util');

module.exports = {
    command: {
        name: "cooldown",
        description: "Reminds you when your kits are off of cooldown",
        options: [{
            type: "STRING",
            name: "username",
            description: "Specify a username",
            required: true,
        }]
    },
    config: {
        cooldown: 10,
        locked: true
    },
    run: async (interaction, args) => {
        await interaction.deferReply();

        interaction.player = await interaction.client.xbox.people.find(args[0], 1);
        interaction.player = interaction.player.people[0];
        if (!interaction.player) {
            const error = new MessageEmbed()
                .addField(`${DESIGN.redx} Invalid Username`, `**${args[0]}** has never played on ECPE servers, please make sure the username you typed is correct.`)
                .setColor(DESIGN.red);

            return interaction.editReply({ embeds: [error] });
        }

        const dorothy = mysql.createConnection(`${process.env.MYSQL_URI}/Dorothy`);
        dorothy.query = util.promisify(dorothy.query).bind(dorothy);

        const data = await dorothy.query(`SELECT * FROM Cooldowns WHERE UserID = ${interaction.user.id}`);
        if (data.length) data.List = JSON.parse(data.List);
        dorothy.end();

        const request = await axios.get(`${process.env.API_URL}/other/${interaction.player.xuid}/kit_cooldowns`, { headers: { token: process.env.API_KEY } }).catch(() => { /* ERR */ });

        // if (!data.length || data?.List?.length < 5) {
        //     const request = await axios.get(`${process.env.API_URL}/other/${interaction.player.xuid}/kit_cooldowns`, { headers: { token: process.env.API_KEY } }).catch(() => { /* ERR */ });
        //     console.log(request)

        // } else {
        //     const error = new MessageEmbed()
        //         .addField(`${DESIGN.redx} Max Cooldowns`, `You can only have a max of 5 cooldowns`)
        //         .setColor(DESIGN.red);

        //     return interaction.editReply({ embeds: [error] });
        // }
    },
};