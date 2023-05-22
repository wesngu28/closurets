
import { SlashCommandBuilder } from 'discord.js';
import { deleteAndFollowUp } from '../helpers/deleteAndFollowUp';
import { Command } from 'types/Command';

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Get both the websocket heartbeat and roundtrip latency of the bot.'),
  async execute(interaction) {
    try {
      if (!interaction.isCommand()) return;
      const wsHeartBeat = interaction.client.ws.ping;
      const roundTrip = Math.abs(Date.now() - interaction.createdTimestamp);
      await interaction.reply(
        `Websocket heartbeat: ${wsHeartBeat}ms, roundtrip latency: ${roundTrip}ms`
      );
    } catch (err) {
      if (!interaction.isCommand()) return;
      deleteAndFollowUp(interaction, 'There was an error while executing this command!');
    }
  },
};
