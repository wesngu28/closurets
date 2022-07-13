import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember, Interaction } from 'discord.js';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { deleteAndFollowUp } from '../helpers/deleteAndFollowUp';
import trackerModel from '../models/trackerModel';
import { VideoSchema } from '../models/Video';
import { AnnouncementEmbed } from '../types/AnnouncementEmbed';
import { Command } from '../types/Command';
import { Tracker } from '../types/Tracker';
import { findLatestVideo } from '../helpers/youtube/findLatestVideo';
import { getIDFromLink } from '../helpers/youtube/getIDFromLink';
import { queryLiveStream } from '../helpers/youtube/queryLiveStream';

const fillChannelCollection = async (
  /* eslint consistent-return: off */
  guildID: string,
  channelID: string
): Promise<void | AnnouncementEmbed> => {
  const guildDB = mongoose.model(`${guildID}`, VideoSchema);
  await guildDB.deleteMany({ authorID: { $ne: channelID } });
  const latestVideo = await findLatestVideo(channelID);
  const preRunAnnounceableStream = await queryLiveStream(guildDB, channelID);
  if (preRunAnnounceableStream) {
    return preRunAnnounceableStream;
  }
  if (latestVideo.link !== 'no latest video found') {
    latestVideo.authorID = channelID;
    await guildDB.create(latestVideo);
  }
};

const getUploadsPlaylist = async (channelID: string): Promise<string> => {
  const videoInfo = await fetch(
    `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&part=snippet&id=${channelID}&key=${process.env.YTAPI}`
  );
  const videoInfojson = await videoInfo.json();
  const uploadsPlaylist = videoInfojson.items[0].contentDetails.relatedPlaylists.uploads;
  return uploadsPlaylist;
};

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
        await interaction.deferReply({ ephemeral: true });
        const id = await getIDFromLink(inputChannel);
        if (id === 'You provided an invalid link') return;
        tracked.ytID = id;
        tracked.uploadsPlaylist = await getUploadsPlaylist(id);
        await tracked.save();
        interaction.editReply({
          content: `Now tracking activity from ${tracked.ytID}`,
        });
        const announceable = await fillChannelCollection(interaction.guild!.id, id);
        if (announceable) {
          interaction.channel!.send(announceable);
        }
        return;
      }
      const inputChannel = interaction.options.getString('channel')!;
      await interaction.deferReply({ ephemeral: true });
      const id = await getIDFromLink(inputChannel);
      if (id === 'You provided an invalid link') return;
      const trackerObject: Tracker = {
        _id: interaction.guild!.id,
        channelID: interaction.channel!.id,
        ytID: id,
        uploadsPlaylist: await getUploadsPlaylist(id),
      };
      await trackerModel.create(trackerObject);
      interaction.editReply({
        content: `Now tracking activity from ${trackerObject.ytID}`,
      });
      const announceable = await fillChannelCollection(interaction.guild!.id, id);
      if (announceable) interaction.channel!.send(announceable);
    } catch (err) {
      if (interaction.isCommand()) {
        await deleteAndFollowUp(interaction, 'There was an error while executing this command!');
      }
    }
  },
};
