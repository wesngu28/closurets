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
): Promise<null | AnnouncementEmbed> => {
  try {
    const guildDB = mongoose.model(`${guildID}`, VideoSchema);
    const liveLink = await findCanonical(channelID);
    console.log(`${guildID}: ${liveLink}`);
    const examineStringsPage = await context.newPage();
    const ytInfoString = await infoStringExamine(liveLink!, examineStringsPage);
    console.log(`${guildID}: ${ytInfoString}`);
    const announcementPage = await context.newPage();
    const announceableStream = await queryLiveStream(
      guildDB,
      channelID,
      liveLink!,
      ytInfoString!,
      announcementPage
    );
    console.log(`${guildID}: ${announceableStream}`);
    if (announceableStream) {
      return announceableStream;
    }
    const latestVideoPage = await context.newPage();
    const afterLaunchLatestVideo = await findLatestVideo(channelID, latestVideoPage);
    if (afterLaunchLatestVideo && afterLaunchLatestVideo.title !== 'no latest video') {
      const { link, title } = afterLaunchLatestVideo as Video;
      const latestID = link.replace('https://www.youtube.com/watch?v=', '');
      const checkChannelVideos = await guildDB.findOne({ title });
      if (checkChannelVideos === null) {
        const anotherAnnouncementPage = await context.newPage();
        const isAnnounceableStream = await makeAnnouncement(latestID, anotherAnnouncementPage);
        if (isAnnounceableStream.publishedDate < date) {
          return null;
        }
        afterLaunchLatestVideo.authorID = channelID;
        isAnnounceableStream.content = `${
          isAnnounceableStream.embeds[0].author!.name
        } has just uploaded ${title} ${link}`;
        await guildDB.create(afterLaunchLatestVideo);
        return isAnnounceableStream;
      }
    }
    return null;
  } catch (err: any) {
    console.log(err.message);
    return null;
  }
};
