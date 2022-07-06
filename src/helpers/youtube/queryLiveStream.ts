import mongoose from 'mongoose';
import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import fetch from 'node-fetch';
import { infoStringExamine } from './infoStringExamine';
import { makeAnnouncement } from './makeAnnouncement';
import { AnnouncementEmbed } from '../../types/AnnouncementEmbed';
import { Video } from '../../types/Video';

const parser = new Parser();

export const queryLiveStream = async (
  db: mongoose.Model<Video, {}, {}, {}>,
  channelID: string
): Promise<void | AnnouncementEmbed> => {
  const response = await fetch(`https://youtube.com/channel/${channelID}/live`);
  const text = await response.text();
  const html = parse(text);
  const canonicalURLTag = html.querySelector('link[rel=canonical]');
  const canonicalURL = canonicalURLTag?.getAttribute('href');
  let resultLink: string;
  if (canonicalURL && canonicalURL.includes('/watch?v=')) {
    const ytInfoString = await infoStringExamine(canonicalURL!);
    if (ytInfoString?.includes('Started')) {
      resultLink = canonicalURL!;
      const stream = await db.findOne({
        link: resultLink,
      });
      if (!stream) {
        const feed = await parser.parseURL(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`
        );
        for await (const video of feed.items) {
          if (
            video.id.replace('yt:video:', '') ===
            resultLink.replace('https://www.youtube.com/watch?v=', '')
          ) {
            video.authorID = channelID;
            await db.create(video);
            const embed = await makeAnnouncement(video.id);
            return embed;
          }
        }
      }
    }
  }
  return undefined;
};
