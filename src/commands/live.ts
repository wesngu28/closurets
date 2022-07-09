import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import parse from 'node-html-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { deleteAndFollowUp } from '../helpers/deleteAndFollowUp';
import channelModel from '../models/channelModel';
import { Command } from '../types/Command';
import { holoLive } from '../types/holoLive';
import { holoVideo } from '../types/holoVideo';
import { timeUntil } from '../util/timeUntil';
import { makeAnnouncement } from '../helpers/youtube/makeAnnouncement';
import { infoStringExamine } from '../helpers/youtube/infoStringExamine';
import { getIDFromLink } from '../helpers/youtube/getIDFromLink';

dotenv.config();

export const live: Command = {
  data: new SlashCommandBuilder()
    .setName('live')
    .setDescription(
      'Check the live status of a youtuber and get a nice embed if they are live, and if they are holodex tracked and not live, get their upcoming stream.'
    )
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription(
          'Please provide a youtube channel (full link), or the first/last/full name of a Holodex streamer.'
        )
        .setRequired(true)
    ),
  async execute(interaction: Interaction) {
    try {
      if (interaction.isCommand()) {
        await interaction.deferReply();
        const name = interaction.options.getString('name');
        const checkID = name?.replace('https://www.youtube.com/channel/', '');
        const searchRegex = new RegExp(
          checkID!
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        );
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
                  `will live soon in ${timeUntil(video.available_at)}`
                ),
                embeds: announcementEmbed.embeds,
              });
              return;
            }
          }
          if (liveJson.length === 0) {
            deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
          }
        } else {
          const otherChannelID = await getIDFromLink(interaction.options.getString('name')!);
          if (otherChannelID === 'You provided an invalid link') {
            deleteAndFollowUp(interaction, 'You provided an invalid field!');
            return;
          }
          if (otherChannelID.includes('shorts')) {
            deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
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
                deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
              }
            } else {
              deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
            }
          }
        }
      }
    } catch (err: any) {
      if (interaction.isCommand()) {
        deleteAndFollowUp(
          interaction,
          `There was an error (${err.message}) while executing this command!`
        );
      }
    }
  },
};
