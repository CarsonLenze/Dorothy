const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const DESIGN = require("../../resources/design.json");

module.exports = {
  command: {
    name: "invite",
    description: "Lets you invite the bot to your own server"
  },
  config: {
    cooldown: 2
  },
  run: async (interaction) => {
    const embed = new MessageEmbed()
      .setDescription('To invite me to your own server please click the button below.')
      .setColor(DESIGN.green);

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Invite Me!')
          .setURL(interaction.client.application.customInstallURL)
          .setStyle('LINK'),
      );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};