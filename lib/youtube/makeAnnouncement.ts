import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { AnnouncementEmbed } from '../../src/types/AnnouncementEmbed';

export const makeAnnouncement = async (videoID: string): Promise<AnnouncementEmbed> => {
  let id = videoID;
  id = id.replace('yt:video:', '');
  const videoInfo = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.YTAPI}`
  );
  const videoInfojson: any = await videoInfo.json();
  const videoInformation = videoInfojson.items[0].snippet;
  const channelPFP = await fetch(
    `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${videoInfojson.items[0].snippet.channelId}&key=${process.env.YTAPI}`
  );
  const channelInfo: any = await channelPFP.json();
  const announcementEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(videoInformation.title)
    .setURL(`https://www.youtube.com/watch?v=${id}`)
    .setAuthor({
      name: videoInformation.channelTitle,
      iconURL: channelInfo.items[0].snippet.thumbnails.default.url,
      url: `https://www.youtube.com/channel/${channelInfo.items[0].id}`,
    })
    .setDescription(videoInformation.description.slice(0, 200))
    .setThumbnail(channelInfo.items[0].snippet.thumbnails.high.url)
    .setImage(videoInformation.thumbnails.high.url)
    .setTimestamp();
  return {
    content: `${videoInformation.channelTitle} is live at https://www.youtube.com/watch?v=${id}`,
    embeds: [announcementEmbed],
  };
};
