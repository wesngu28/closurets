import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import fetch from 'node-fetch';
import { parseHTML, parseJSON } from '../util/parserSnippets';
import { Video } from '../types/Video';
import { deleteAndFollowUp } from '../helpers/deleteAndFollowUp';
import channelModel from '../models/channelModel';
import { Command } from '../types/Command';
import { HolodexChannel } from '../types/HolodexChannel';
import { HolodexVideo } from '../types/HolodexVideo';
import { timeUntil } from '../util/timeUntil';
import { makeAnnouncement } from '../helpers/youtube/makeAnnouncement';
import { getIDFromLink } from '../helpers/youtube/getIDFromLink';

export const live: Command = {
  data: new SlashCommandBuilder()
    .setName('live')
    .setDescription('Check the live status of a youtuber and get a nice embed if they are live.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription(
          'Please provide a youtube channel link, or the first/last/full name of a Holodex streamer.'
        )
        .setRequired(true)
    ),
  async execute(interaction: Interaction) {
    try {
      if (!interaction.isCommand()) return;
      await interaction.deferReply();
      let capitalizeFirstCharacters = interaction.options
        .getString('name')
        ?.replace('https://www.youtube.com/channel/', '')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')!;
      if (capitalizeFirstCharacters === 'Irys') capitalizeFirstCharacters = 'IRyS';
      const searchRegex = new RegExp(capitalizeFirstCharacters);
      const match = await channelModel.findOne({
        $or: [{ name: searchRegex }, { english_name: searchRegex }, { id: searchRegex }],
      });
      if (match) {
        const responseLive = await fetch(`https://holodex.net/api/v2/live?channel_id=${match.id}`);
        const liveJson: Array<HolodexChannel> = await responseLive.json();
        for await (const video of liveJson) {
          if (video.status === 'live' && video.live_viewers !== 0) {
            const responseLivestream = await fetch(`https://holodex.net/api/v2/videos/${video.id}`);
            const livestreamJson: HolodexVideo = await responseLivestream.json();
            const announcementEmbed = await makeAnnouncement(livestreamJson);
            await interaction.editReply(announcementEmbed);
            return;
          }
          if (video.status === 'upcoming') {
            const responseLivestream = await fetch(`https://holodex.net/api/v2/videos/${video.id}`);
            const livestreamJson: HolodexVideo = await responseLivestream.json();
            const announcementEmbed = await makeAnnouncement(livestreamJson);
            await interaction.editReply({
              content: announcementEmbed.content.replace(
                'is live at',
                `will be live soon in ${timeUntil(video.available_at)}`
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
        if (!otherChannelID) {
          deleteAndFollowUp(interaction, 'You provided an invalid field!');
          return;
        }
        if (otherChannelID.includes('shorts')) {
          deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
          return;
        }
        const chHTML = await parseHTML(`https://youtube.com/channel/${otherChannelID}/live`);
        const liveLink = chHTML.querySelector('link[rel=canonical]')!.getAttribute('href')!;
        if (liveLink.includes('/watch?v=')) {
          const liveVideoHTML = await parseHTML(liveLink);
          const allScripts = liveVideoHTML.querySelectorAll('script');
          const titleJSON = await parseJSON(allScripts);
          if (!titleJSON) return;
          const { videoPrimaryInfoRenderer } =
            titleJSON.contents.twoColumnWatchNextResults.results.results.contents[0];
          const { videoViewCountRenderer: vVCR } = videoPrimaryInfoRenderer.viewCount;
          const titleLiveArr = [];
          titleLiveArr.push(videoPrimaryInfoRenderer.title.runs[0].text);
          if (vVCR.isLive && vVCR.viewCount.runs[1].text.includes('watching')) {
            titleLiveArr.push(true);
          } else {
            titleLiveArr.push(false);
          }
          if (titleLiveArr.length === 0) return;
          const [title, liveStatus] = titleLiveArr;
          if (liveStatus === false) {
            deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
            return;
          }
          const video: Video = {
            title: title!,
            link: liveLink,
            live: liveStatus,
            id: liveLink.replace('https://www.youtube.com/watch?v=', ''),
          };
          const announcementEmbed = await makeAnnouncement(video);
          await interaction.editReply(announcementEmbed);
        } else {
          deleteAndFollowUp(interaction, 'That channel is not currently streaming!');
        }
      }
    } catch (err: any) {
      if (interaction.isCommand()) {
        deleteAndFollowUp(interaction, `There was an error while executing this command!`);
      }
    }
  },
};
