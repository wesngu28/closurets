import { GuildMember, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import mongoose from 'mongoose';
import { makeAnnouncement } from '../helpers/youtube/makeAnnouncement';
import trackerModel from '../models/trackerModel';
import { VideoSchema } from '../models/Video';
import { AnnouncementEmbed } from '../types/AnnouncementEmbed';
import { Tracker } from '../types/Tracker';
import { findLatestVideo } from '../helpers/youtube/findLatestVideo';
import { getIDFromLink } from '../helpers/youtube/getIDFromLink';
import { Command } from 'types/Command';

const fillChannelCollection = async (
  guildID: string,
  channelID: string
): Promise<null | AnnouncementEmbed> => {
  const guildDB = mongoose.model(`${guildID}`, VideoSchema);
  await guildDB.deleteMany({ authorID: { $ne: channelID } });
  const latestVideo = await findLatestVideo(channelID);
  if (!latestVideo) return null;
  if (latestVideo.live === true) {
    const announcement = await makeAnnouncement(latestVideo!);
    await guildDB.create(latestVideo);
    return announcement;
  }
  latestVideo.authorID = channelID;
  await guildDB.create(latestVideo);
  return null;
};

export const configureTracker: Command = {
  data: new SlashCommandBuilder()
    .setName('tracker')
    .setDescription('Configure channel to track and where to post.')
    .addStringOption(option =>
      option.setName('channel').setDescription('Post a youtube channel link').setRequired(true)
    ),
  async execute(interaction) {
    try {
      if (!interaction.isCommand()) return;
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
          content: 'You are not able to execute this command!',
          ephemeral: true,
        });
        return;
      }
      const tracked = await trackerModel.findOne({ _id: interaction.guild!.id });
      if (tracked) {
        tracked.channelID = interaction.channel!.id;
        const inputChannel = interaction.options.get('channel')?.value?.toString()!;
        if (inputChannel === tracked.ytID) {
          interaction.reply({
            content: 'You provided an already tracked channel',
            ephemeral: true,
          });
          return;
        }
        await interaction.deferReply({ ephemeral: true });
        const id = await getIDFromLink(inputChannel);
        if (!id) return;
        tracked.ytID = id;
        await tracked.save();
        interaction.editReply({
          content: `Now tracking activity from ${tracked.ytID}`,
        });
        const announceable = await fillChannelCollection(interaction.guild!.id, id);
        if (announceable) interaction.channel!.send(announceable);
        return;
      }
      const inputChannel = interaction.options.get('channel')?.value?.toString()!;
      await interaction.deferReply({ ephemeral: true });
      const id = await getIDFromLink(inputChannel);
      if (!id) return;
      const trackerObject: Tracker = {
        _id: interaction.guild!.id,
        channelID: interaction.channel!.id,
        ytID: id,
      };
      await trackerModel.create(trackerObject);
      interaction.editReply({
        content: `Now tracking activity from ${trackerObject.ytID}`,
      });
      const announceable = await fillChannelCollection(interaction.guild!.id, id);
      if (announceable) interaction.channel!.send(announceable);
    } catch (err) {
      if (interaction.isCommand()) {
        await interaction.editReply('There was an error while executing this command!');
      }
    }
  },
};
