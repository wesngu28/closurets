import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import Parser from 'rss-parser';
import { VideoSchema } from '../../src/models/Video';
import { AnnouncementEmbed } from '../../src/types/AnnouncementEmbed';
import { infoStringExamine } from './infoStringExamine';
import { queryLiveStream } from './queryLiveStream';
import { Video } from '../../src/types/Video';
import { makeAnnouncement } from './makeAnnouncement';

const parser = new Parser();

export const fetchLiveStream = async (
  guildID: string,
  channelID: string,
  date: string
): Promise<void | AnnouncementEmbed> => {
  try {
    // Create a MongoDB model named after the guild
    const guildDB = mongoose.model(`${guildID}`, VideoSchema);
    // If the tracked channel has changed, delete all the old videos kept from the old one
    await guildDB.deleteMany({ authorID: { $ne: channelID } });

    // Parse the XML feed for videos, alternatively could use puppeteer or the youtube api
    const feed = await parser.parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`
    );

    // Check if there are already videos, this could be moved to ready for readability
    const addFeed = await guildDB.find();

    // Fill the database with videos from the XML feed that are after the ready date of the bot. This probably does nothing.
    if (addFeed.length === 0) {
      const videos = feed.items;
      for await (const video of videos) {
        video.authorID = channelID;
        const ytInfoString = await infoStringExamine(video.link!);
        // Non-waiting room streams and any uploads that are somehow added in the short time between the run of this and the bot initialization
        if (!ytInfoString?.includes('Scheduled') && video.isoDate?.toString()! > date) {
          await guildDB.create(video);
        }
      }
      const browser = await puppeteer.launch({
        headless: true,
        userDataDir: './puppet',
        args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(`https://www.youtube.com/channel/${channelID}/videos`);
      const latestLink = await page.evaluate(() => {
        const info = document.querySelector('#video-title');
        return info ? (info as HTMLAnchorElement).href : 'Nothing';
      });
      if (latestLink !== 'Nothing') {
        const latestTitle = await page.evaluate(() => {
          const info = document.querySelector('#video-title')?.textContent!;
          return info;
        });
        await browser.close();
        const latestVideo: Video = {
          title: latestTitle,
          link: latestLink,
        };
        latestVideo.authorID = channelID;
        await guildDB.create(latestVideo);
      }
      // The above will not detect streams that are live but started after initialization, so announce them and add them to database.
      const preRunAnnounceableStream = await queryLiveStream(guildDB, channelID);
      if (preRunAnnounceableStream) {
        return preRunAnnounceableStream;
      }
    }

    // Scheduled streams are not added so if a stream has went from scheduled to live it needs to be announced and added.
    const announceableStream = await queryLiveStream(guildDB, channelID);
    if (announceableStream) {
      return announceableStream;
    }

    // Needed to snipe uploads that may not update in the XML on time
    const browser = await puppeteer.launch({
      headless: true,
      userDataDir: './puppet',
      args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`https://www.youtube.com/channel/${channelID}/videos`);
    const latestLink = await page.evaluate(() => {
      const info = document.querySelector('#video-title');
      return info ? (info as HTMLAnchorElement).href : 'Nothing';
    });
    if (latestLink !== 'Nothing') {
      const latestID = latestLink.replace('https://www.youtube.com/watch?v=', '');
      const latestTitle = await page.evaluate(() => {
        const info = document.querySelector('#video-title')?.textContent!;
        return info;
      });
      await browser.close();
      const checkChannelVideos = await guildDB.findOne({ title: latestTitle });
      if (checkChannelVideos === null) {
        // If it doesn't exist, assume that it needs to be added.
        const latestVideo: Video = {
          title: latestTitle,
          link: latestLink,
        };
        // Check to see whether or not this is somehow a stream.
        const isAnnounceableStream = await makeAnnouncement(latestID);
        // Make sure this video isn't older than bot run
        latestVideo.authorID = channelID;
        // Examine the info strings of this video.
        const ytInfoString = await infoStringExamine(latestVideo.link);
        if (
          (ytInfoString?.includes('Started') || ytInfoString?.includes('watching now')) &&
          !ytInfoString?.includes('Scheduled') &&
          isAnnounceableStream
        ) {
          await guildDB.create(latestVideo);
          return isAnnounceableStream;
        }
        if (!ytInfoString?.includes('Scheduled')) {
          isAnnounceableStream.content = `@everyone ${
            isAnnounceableStream.embeds[0].author!.name
          } has just uploaded ${latestVideo.title} ${latestVideo.link}`;
          await guildDB.create(latestVideo);
          return isAnnounceableStream;
        }
      }
    }
    await browser.close();
    // // Videos are already in the database so we should only have to check the latest video in the XML.
    // if(addFeed.length > 0) {
    //   // Scheduled streams are not added so if a stream has went from scheduled to live it needs to be announced and added.
    //   const announceableStream = await queryLiveStream(guildDB, channelID);
    //   if(announceableStream) {
    //     return announceableStream;
    //   }
    //   // If the latest video in the XML feed is newer than the bot's runtime, enter this if.
    //   if(feed.items[0].isoDate?.toString()! > date) {
    //     // Check if it already exists in the database somehow
    //     const checkLatestVideo = await guildDB.findOne({ title: feed.items[0].title });
    //     if(checkLatestVideo === null) {
    //       // If it doesn't exist, assume that it needs to be added.
    //       const latestVideo = feed.items[0];
    //       // Check to see whether or not this is somehow a stream.
    //       const announceableStream = await makeAnnouncement(latestVideo.id);
    //       latestVideo.authorID = channelID;
    //       if(latestVideo.link === undefined) {
    //         return;
    //       }
    //       // Examine the info strings of this video.
    //       const ytInfoString = await infoStringExamine(latestVideo.link);
    //       if((ytInfoString?.includes('Started') || ytInfoString?.includes('watching now')) && !ytInfoString?.includes('Scheduled') && announceableStream) {
    //         await guildDB.create(latestVideo);
    //         return announceableStream;
    //       }
    //       if(!ytInfoString?.includes('Scheduled')) {
    //         announceableStream.content = `@everyone ${latestVideo.author} has just uploaded ${latestVideo.title} ${latestVideo.link}`;
    //         await guildDB.create(latestVideo);
    //         return announceableStream;
    //       }
    //     }
    //   }
    return undefined;
  } catch (err: any) {
    return undefined;
  }
};
