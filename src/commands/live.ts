import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import parse from 'node-html-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { chromium } from 'playwright-chromium';
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
    .setDescription('Check the live status of a youtuber and get a nice embed if they are live.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription(
          'Please provide a youtube channel (full link), or the first/last/full name of a Holodex streamer.'
        )
        .setRequired(true)
    ),
  async execute(interaction: Interaction) {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
    });
    const context = await browser.newContext();
    try {
      if (interaction.isCommand()) {
        await interaction.deferReply();
        const name = interaction.options.getString('name');
        let checkID = name
          ?.replace('https://www.youtube.com/channel/', '')
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        if (checkID === 'Irys') checkID = 'IRyS';
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
              const announcementPage = await context.newPage();
              const announcementEmbed = await makeAnnouncement(livestreamJson.id, announcementPage);
              await interaction.editReply({
                content: announcementEmbed.content,
                embeds: announcementEmbed.embeds,
              });
              await browser.close();
              return;
            }
            if (video.status === 'upcoming') {
              const responseLivestream = await fetch(
                `https://holodex.net/api/v2/videos/${video.id}`
              );
              const livestreamJson: holoVideo = (await responseLivestream.json()) as holoVideo;
              const announcementPage = await context.newPage();
              const announcementEmbed = await makeAnnouncement(livestreamJson.id, announcementPage);
              await interaction.editReply({
                content: announcementEmbed.content.replace(
                  'is live at',
                  `will be live soon in ${timeUntil(video.available_at)}`
                ),
                embeds: announcementEmbed.embeds,
              });
              await browser.close();
              return;
            }
            await browser.close();
          }
          if (liveJson.length === 0) {
            deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
            await browser.close();
          }
        } else {
          const otherChannelID = await getIDFromLink(interaction.options.getString('name')!);
          if (!otherChannelID) {
            deleteAndFollowUp(interaction, 'You provided an invalid field!');
            await browser.close();
            return;
          }
          if (otherChannelID.includes('shorts')) {
            deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
            await browser.close();
          } else {
            const response = await fetch(`https://youtube.com/channel/${otherChannelID}/live`);
            const text = await response.text();
            const html = parse(text);
            const canonicalURLTag = html.querySelector('link[rel=canonical]');
            let canonicalURL = canonicalURLTag!.getAttribute('href')!;
            if (canonicalURL.includes('/watch?v=')) {
              const examineStringsPage = await context.newPage();
              const ytInfoString = await infoStringExamine(canonicalURL, examineStringsPage);
              if (ytInfoString!.includes('Started')) {
                const cutString = 'https://www.youtube.com/watch?v=';
                const queryIndex = canonicalURL.indexOf('https://www.youtube.com/watch?v=');
                canonicalURL = canonicalURL.replace(
                  canonicalURL.substring(queryIndex, cutString.length),
                  ''
                );
                const announcementPage = await context.newPage();
                const announcementEmbed = await makeAnnouncement(canonicalURL, announcementPage);
                await interaction.editReply({
                  content: announcementEmbed.content,
                  embeds: announcementEmbed.embeds,
                });
                await browser.close();
              } else {
                deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
                await browser.close();
              }
            } else {
              deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
              await browser.close();
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
        await browser.close();
      }
    }
  },
};
