const { checkCooldown } = require("../../resources/functions.js");
const DESIGN = require("../../resources/design.json");
const { MessageEmbed } = require("discord.js");
const { readFileSync } = require("fs");

module.exports = async (bot, interaction) => {

    /* 
        --------------------------------------------------
        Allowed config options: 
            - ?name (String)
            - ?locked (Bloenan)
            - ?cooldown (Integer)
        --------------------------------------------------
    */

    let file;
    (!interaction.isMessageComponent()) ? file = bot.commands.get(interaction.commandName) : file = bot.buttons.get(interaction.customId.split('-')[0]);
    if (!file) return;

    const cache = JSON.parse(readFileSync("resources/cache.json")).blacklists;
    const blacklists = cache.map(data => data.UserID);
    if (blacklists.includes(interaction.user.id)) {
        const blacklisted = new MessageEmbed()
            .addField(`${DESIGN.redx} Blacklisted`, 'You are banned from using this bot.')
            .setColor(DESIGN.red)

        return interaction.reply({ embeds: [blacklisted], ephemeral: true });
    }

    if (file.config.locked) {
        const owner = bot.application.owner;
        const developers = owner.ownerId ? owner.members.map(member => member.user.id) : [owner.id]
        if (!developers.includes(interaction.user.id)) {
            const developer = new MessageEmbed()
                .addField(`${DESIGN.redx} Developer Command`, 'You can not run this command.')
                .setColor(DESIGN.red);

            return interaction.reply({ embeds: [developer], ephemeral: true });
        }
    }

    if (file.config.cooldown) {
        if (interaction.isMessageComponent()) interaction.commandName = interaction.customId.split('-')[0];
        const cooldownCheck = checkCooldown(interaction.commandName, interaction.user.id, file.config.cooldown, interaction.customId);

        if (cooldownCheck.cooldown) {
            const cooldown = new MessageEmbed()
                .addField(`${DESIGN.redx} Cooldown`, cooldownCheck.message)
                .setColor(DESIGN.red);

            return interaction.reply({ embeds: [cooldown], ephemeral: true });
        }
    }

    let args = [];
    if (interaction.options?._hoistedOptions) interaction.options._hoistedOptions.forEach(x => args.push(x.value));

    if (args.length < 1) args = undefined;
    if (!interaction.options) {
        args = interaction.customId.split('-');
        if (interaction.values) {
            const values = interaction.values;
            values.forEach((value) => {
                value = value.split('-'); value.shift();
                value.forEach((key) => args.push(key));
            });
        }
        if (interaction.fields) {
            const { fields } = interaction.fields;
            fields.forEach((field) => args.push(field.data.value));
        }
        args.shift();
    }

    file.run(interaction, args);
};