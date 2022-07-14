import mongoose from 'mongoose';
import Parser from 'rss-parser';
import { Page } from 'playwright-chromium';
import { makeAnnouncement } from './makeAnnouncement';
import { AnnouncementEmbed } from '../../types/AnnouncementEmbed';
import { Video } from '../../types/Video';

const parser = new Parser();

export const queryLiveStream = async (
  db: mongoose.Model<Video, {}, {}, {}>,
  channelID: string,
  liveLink: string,
  ytInfoString: string,
  page: Page
): Promise<void | AnnouncementEmbed> => {
  if (ytInfoString?.includes('Started')) {
    const stream = await db.findOne({
      link: liveLink,
    });
    if (!stream) {
      const feed = await parser.parseURL(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`
      );
      for await (const video of feed.items) {
        if (
          video.id.replace('yt:video:', '') ===
          liveLink.replace('https://www.youtube.com/watch?v=', '')
        ) {
          video.authorID = channelID;
          await db.create(video);
          const embed = await makeAnnouncement(video.id, page);
          return embed;
        }
      }
    }
  }
  return undefined;
};
