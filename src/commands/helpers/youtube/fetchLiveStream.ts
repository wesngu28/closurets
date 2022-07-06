import mongoose from 'mongoose';
import { VideoSchema } from '../../../models/Video';
import { AnnouncementEmbed } from '../../../types/AnnouncementEmbed';
import { infoStringExamine } from './infoStringExamine';
import { queryLiveStream } from './queryLiveStream';
import { Video } from '../../../types/Video';
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
    // This should take care of both uploads and spontaneous streams
    const afterLaunchLatestVideo = await findLatestVideo(channelID);
    if (afterLaunchLatestVideo !== 'no latest video') {
      const newVideo = afterLaunchLatestVideo as Video;
      const latestID = newVideo.link.replace('https://www.youtube.com/watch?v=', '');
      const checkChannelVideos = await guildDB.findOne({ title: newVideo.title });
      if (checkChannelVideos === null) {
        // Check to see whether or not this is somehow a stream.
        const isAnnounceableStream = await makeAnnouncement(latestID);
        if (isAnnounceableStream.publishedDate < date) {
          return undefined;
        }
        // Make sure this video isn't older than bot run
        newVideo.authorID = channelID;
        // Examine the info strings of this video.
        const ytInfoString = await infoStringExamine(newVideo.link);
        if (
          (ytInfoString?.includes('Started') || ytInfoString?.includes('watching now')) &&
          !ytInfoString?.includes('Scheduled') &&
          isAnnounceableStream
        ) {
          await guildDB.create(newVideo);
          return isAnnounceableStream;
        }
        if (!ytInfoString?.includes('Scheduled')) {
          isAnnounceableStream.content = `@everyone ${
            isAnnounceableStream.embeds[0].author!.name
          } has just uploaded ${newVideo.title} ${newVideo.link}`;
          await guildDB.create(newVideo);
          return isAnnounceableStream;
        }
      }
    }
    return undefined;
  } catch (err: any) {
    return undefined;
  }
};