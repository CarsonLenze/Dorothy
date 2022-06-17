const DESIGN = require("../../resources/design.json");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

module.exports = {
  command: {
    name: "ping",
    description: "shows uptime and current latency"
  },
  config: {
    cooldown: 2
  },
  run: async (interaction) => {
    const sent = await interaction.deferReply({ fetchReply: true });
    const embed = new MessageEmbed()
      .setDescription(`<:online:981315103611813968> **UPTIME:** ${ms(interaction.client.uptime, { long: true })}\n\n<:client:981315291965448202> **CLIENT PING:** ${ms(interaction.client.ws.ping)}\n\n<:slowmode:981315291726381126> **MY PING:** ${ms(sent.createdTimestamp - interaction.createdTimestamp)}`)
      .setColor(DESIGN.green);

    await interaction.editReply({ embeds: [embed] });
  },
};