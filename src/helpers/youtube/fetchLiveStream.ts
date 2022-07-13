import mongoose from 'mongoose';
import { BrowserContext } from 'playwright-chromium';
import { VideoSchema } from '../../models/Video';
import { AnnouncementEmbed } from '../../types/AnnouncementEmbed';
import { queryLiveStream } from './queryLiveStream';
import { Video } from '../../types/Video';
import { makeAnnouncement } from './makeAnnouncement';
import { findLatestVideo } from './findLatestVideo';
import { findCanonical } from './findCanonical';
import { infoStringExamine } from './infoStringExamine';

export const fetchLiveStream = async (
  guildID: string,
  channelID: string,
  date: string,
  context: BrowserContext
): Promise<void | AnnouncementEmbed> => {
  try {
    const guildDB = mongoose.model(`${guildID}`, VideoSchema);
    const liveLink = await findCanonical(channelID);
    const examineStringsPage = await context.newPage();
    const ytInfoString = await infoStringExamine(liveLink!, examineStringsPage);
    const announceableStream = await queryLiveStream(guildDB, channelID, liveLink!, ytInfoString!);
    if (announceableStream) {
      await context.close();
      return announceableStream;
    }
    const latestVideoPage = await context.newPage();
    const afterLaunchLatestVideo = await findLatestVideo(channelID, latestVideoPage);
    if (afterLaunchLatestVideo.title !== 'no latest video') {
      const newVideo = afterLaunchLatestVideo as Video;
      const latestID = newVideo.link.replace('https://www.youtube.com/watch?v=', '');
      const checkChannelVideos = await guildDB.findOne({ title: newVideo.title });
      if (checkChannelVideos === null) {
        const isAnnounceableStream = await makeAnnouncement(latestID);
        if (isAnnounceableStream.publishedDate < date) {
          await context.close();
          return undefined;
        }
        newVideo.authorID = channelID;
        isAnnounceableStream.content = `${
          isAnnounceableStream.embeds[0].author!.name
        } has just uploaded ${newVideo.title} ${newVideo.link}`;
        await guildDB.create(newVideo);
        await context.close();
        return isAnnounceableStream;
      }
    }
    await context.close();
    return undefined;
  } catch (err: any) {
    await context.close();
    return undefined;
  }
};
