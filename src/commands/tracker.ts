import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember, Interaction } from 'discord.js';
import trackerModel from '../models/trackerModel';
import { Command } from '../types/Command';
import { Tracker } from '../types/Tracker';
import { fillChannelCollection } from './helpers/youtube/fillChannelCollection';
import { getIDFromLink } from './helpers/youtube/getIDFromLink';

export const configureTracker: Command = {
  data: new SlashCommandBuilder()
    .setName('tracker')
    .setDescription('Configure channel to track and where to post.')
    .addStringOption(option =>
      option
        .setName('channel')
        .setDescription('Channel id (these are in /channel/ urls)')
        .setRequired(true)
    ),
  async execute(interaction: Interaction) {
    try {
      if (!interaction.isCommand()) {
        return;
      }
      const member = interaction.member as GuildMember;
      if (member!.permissions.has('ADMINISTRATOR') === false) {
        await interaction.reply({
          content: 'You are not able to execute this command!',
          ephemeral: true,
        });
        return;
      }
      const tracked = await trackerModel.findOne({ _id: interaction.guild!.id });
      if (tracked) {
        tracked.channelID = interaction.channel!.id;
        const inputChannel = interaction.options.getString('channel')!;
        if (inputChannel === tracked.ytID) {
          interaction.reply({
            content: 'You provided an already tracked channel',
            ephemeral: true,
          });
          return;
        }
        const id = await getIDFromLink(inputChannel);
        if (id === 'You provided an invalid link') return;
        tracked.ytID = id;
        await tracked.save();
        interaction.reply({
          content: `Now tracking activity from ${tracked.ytID}`,
          ephemeral: true,
        });
        const announceable = await fillChannelCollection(interaction.guild!.id, id);
        if (announceable && interaction.channel?.isText()) {
          interaction.channel.send(announceable);
        }
      }
      const trackerObject: Tracker = {
        _id: interaction.guild!.id,
        channelID: interaction.channel!.id,
      };
      const inputChannel = interaction.options.getString('channel')!;
      const id = await getIDFromLink(inputChannel);
      if (id === 'You provided an invalid link') return;
      trackerObject.ytID = id;
      await trackerModel.create(trackerObject);
      interaction.reply({
        content: `Now tracking activity from ${trackerObject.ytID}`,
        ephemeral: true,
      });
      const announceable = await fillChannelCollection(interaction.guild!.id, id);
      if (announceable && interaction.channel?.isText()) interaction.channel.send(announceable);
    } catch (err) {
      if (interaction.isCommand()) {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  },
};
