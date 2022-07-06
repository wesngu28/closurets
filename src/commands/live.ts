import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import parse from 'node-html-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import channelModel from '../models/channelModel';
import { Command } from '../types/Command';
import { holoLive } from '../types/holoLive';
import { holoVideo } from '../types/holoVideo';
import { timeUntil } from '../util/timeUntil';
import { makeAnnouncement } from './helpers/youtube/makeAnnouncement';
import { infoStringExamine } from './helpers/youtube/infoStringExamine';
import { getIDFromLink } from './helpers/youtube/getIDFromLink';

dotenv.config();

export const live: Command = {
  data: new SlashCommandBuilder()
    .setName('live')
    .setDescription('Name for vtuber, must be in Holodex.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Please provide either first/last or full name for a vtuber in holodex.')
        .setRequired(true)
    ),
  async execute(interaction: Interaction) {
    try {
      if (interaction.isCommand()) {
        await interaction.deferReply();
        const name = interaction.options.getString('name');
        const checkID = name?.replace('https://www.youtube.com/channel/', '');
        const searchRegex = new RegExp(checkID!);
        const match = await channelModel
          .find({
            $or: [{ name: searchRegex }, { english_name: searchRegex }, { id: searchRegex }],
          })
          .limit(1);
        if (match[0]) {
          const responseLive = await fetch(
            `https://holodex.net/api/v2/live?channel_id=${match[0].id}`
          );
          const liveJson: Array<holoLive> = (await responseLive.json()) as Array<holoLive>;
          for await (const video of liveJson) {
            if (video.status === 'live' && video.live_viewers !== 0) {
              const responseLivestream = await fetch(
                `https://holodex.net/api/v2/videos/${video.id}`
              );
              const livestreamJson: holoVideo = (await responseLivestream.json()) as holoVideo;
              const announcementEmbed = await makeAnnouncement(livestreamJson.id);
              await interaction.editReply({
                content: announcementEmbed.content,
                embeds: announcementEmbed.embeds,
              });
              return;
            }
            if (video.status === 'upcoming') {
              const responseLivestream = await fetch(
                `https://holodex.net/api/v2/videos/${video.id}`
              );
              const livestreamJson: holoVideo = (await responseLivestream.json()) as holoVideo;
              const announcementEmbed = await makeAnnouncement(livestreamJson.id);
              await interaction.editReply({
                content: announcementEmbed.content.replace(
                  'is live at',
                  `is not currently live but will be soon in ${timeUntil(video.available_at)}`
                ),
                embeds: announcementEmbed.embeds,
              });
              return;
            }
          }
          if (liveJson.length === 0) {
            await interaction.deleteReply();
            await interaction.followUp({
              content: 'That channel is not currently streaming!',
              ephemeral: true,
            });
          }
        } else {
          const otherChannelID = await getIDFromLink(interaction.options.getString('name')!);
          if (otherChannelID === 'You provided an invalid link') {
            await interaction.deleteReply();
            await interaction.followUp({
              content: 'You provided an invalid field!',
              ephemeral: true,
            });
            return;
          }
          if (otherChannelID.includes('shorts')) {
            await interaction.deleteReply();
            await interaction.followUp({
              content: 'That channel is not currently streaming!',
              ephemeral: true,
            });
          } else {
            const response = await fetch(`https://youtube.com/channel/${otherChannelID}/live`);
            const text = await response.text();
            const html = parse(text);
            const canonicalURLTag = html.querySelector('link[rel=canonical]');
            let canonicalURL = canonicalURLTag!.getAttribute('href')!;
            if (canonicalURL.includes('/watch?v=')) {
              const ytInfoString = await infoStringExamine(canonicalURL);
              if (ytInfoString!.includes('Started')) {
                const cutString = 'https://www.youtube.com/watch?v=';
                const queryIndex = canonicalURL.indexOf('https://www.youtube.com/watch?v=');
                canonicalURL = canonicalURL.replace(
                  canonicalURL.substring(queryIndex, cutString.length),
                  ''
                );
                const announcementEmbed = await makeAnnouncement(canonicalURL);
                await interaction.editReply({
                  content: announcementEmbed.content,
                  embeds: announcementEmbed.embeds,
                });
              } else {
                await interaction.deleteReply();
                await interaction.followUp({
                  content: 'That channel is not currently streaming!',
                  ephemeral: true,
                });
              }
            } else {
              await interaction.deleteReply();
              await interaction.followUp({
                content: 'That channel is not currently streaming!',
                ephemeral: true,
              });
            }
          }
        }
      }
    } catch (err) {
      if (interaction.isCommand()) {
        await interaction.deleteReply();
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  },
};
