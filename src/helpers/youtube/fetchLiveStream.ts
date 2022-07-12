import mongoose from 'mongoose';
import { VideoSchema } from '../../models/Video';
import { AnnouncementEmbed } from '../../types/AnnouncementEmbed';
import { queryLiveStream } from './queryLiveStream';
import { Video } from '../../types/Video';
import { makeAnnouncement } from './makeAnnouncement';
import { findLatestVideo } from './findLatestVideo';

export const fetchLiveStream = async (
  guildID: string,
  channelID: string,
  date: string
): Promise<void | AnnouncementEmbed> => {
  try {
    const guildDB = mongoose.model(`${guildID}`, VideoSchema);
    const announceableStream = await queryLiveStream(guildDB, channelID);
    if (announceableStream) {
      return announceableStream;
    }
    const afterLaunchLatestVideo = await findLatestVideo(channelID);
    if (afterLaunchLatestVideo !== 'no latest video') {
      const newVideo = afterLaunchLatestVideo as Video;
      const latestID = newVideo.link.replace('https://www.youtube.com/watch?v=', '');
      const checkChannelVideos = await guildDB.findOne({ title: newVideo.title });
      if (checkChannelVideos === null) {
        const isAnnounceableStream = await makeAnnouncement(latestID);
        if (isAnnounceableStream.publishedDate < date) {
          return undefined;
        }
        newVideo.authorID = channelID;
        isAnnounceableStream.content = `${
          isAnnounceableStream.embeds[0].author!.name
        } has just uploaded ${newVideo.title} ${newVideo.link}`;
        await guildDB.create(newVideo);
        return isAnnounceableStream;
      }
    }
    return undefined;
  } catch (err: any) {
    return undefined;
  }
};
