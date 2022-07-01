import { MessageEmbed } from 'discord.js';
import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import { Video, VideoSchema } from '../models/Video';
import mongoose from 'mongoose';
let parser = new Parser();

export type AnnouncementEmbed = {
  content: string;
  embeds: MessageEmbed[];
}

export async function fetchLiveStream(guildID: string, channelID: string, date: string): Promise<void | AnnouncementEmbed> {
  try {
    // Create a MongoDB model named after the guild
    let guildDB = mongoose.model(`${guildID}`, VideoSchema);
    // If the tracked channel has changed, delete all the old videos kept from the old one
    await guildDB.deleteMany( { authorID: { "$ne": channelID}});

    // Parse the XML feed for videos, alternatively could use puppeteer or the youtube api
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`);

    // Check if there are already videos, this could be moved to ready for readability
    const addFeed = await guildDB.find();

    // Fill the database with videos from the XML feed that are after the ready date of the bot. This probably does nothing.
    if(addFeed.length === 0) {
      const videos = feed.items;
      for(let i = 0; i < videos.length; i++) {
        videos[i].authorID = channelID;
        const ytInfoString = await infoStringExamine(videos[i].link!);
        // Non-waiting room streams and any uploads that are somehow added in the short time between the run of this and the bot initialization
        if(!ytInfoString?.includes('Scheduled') && videos[i].isoDate?.toString()! > date ) {
          await guildDB.create(videos[i]);
        }
      }
      // The above will not detect streams that are live but started after initialization, so announce them and add them to database.
      const announceableStream = await queryLiveStream(guildDB, channelID);
      if(announceableStream) {
        return announceableStream;
      }
    }

    // Scheduled streams are not added so if a stream has went from scheduled to live it needs to be announced and added.
    const announceableStream = await queryLiveStream(guildDB, channelID);
    if(announceableStream) {
      return announceableStream;
    }

    // Needed to snipe uploads that may not update in the XML on time
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox, --single-process', '--no-zygote']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080});
    await page.goto(`https://www.youtube.com/channel/${channelID}/videos`);
    let latestLink = await page.evaluate(()=> {
      let info = document.querySelector('#video-title');
      return (info ? (info as HTMLAnchorElement).href : 'Nothing')
    })
    if(latestLink !== 'Nothing') {
      const latestID = latestLink.replace('https://www.youtube.com/watch?v=', '');
      let latestTitle = await page.evaluate(()=> {
        let info = document.querySelector('#video-title')?.textContent!;
        return info;
      })
      console.log('This is the link: '+ latestLink);
      console.log('This is the id: ' + latestID);
      console.log('This is the title: ' + latestTitle)
      await browser.close();
      const checkChannelVideos = await guildDB.findOne({ title: latestTitle });
      if(checkChannelVideos === null) {
        // If it doesn't exist, assume that it needs to be added.
        const latestVideo: Video = {
          title: latestTitle,
          link: latestLink
        };
        // Check to see whether or not this is somehow a stream.
        const announceableStream = await makeAnnouncement(latestID);
        // Make sure this video isn't older than bot run
        if(announceableStream.embeds[0].footer?.text! > date) {
          latestVideo.authorID = channelID;
          // Examine the info strings of this video.
          const ytInfoString = await infoStringExamine(latestVideo.link);
          if((ytInfoString?.includes('Started') || ytInfoString?.includes('watching now')) && !ytInfoString?.includes('Scheduled') && announceableStream) {
            await guildDB.create(latestVideo);
            return announceableStream;
          }
          if(!ytInfoString?.includes('Scheduled')) {
            announceableStream.content = `@everyone ${announceableStream.embeds[0].author!.name} has just uploaded ${latestVideo.title} ${latestVideo.link}`;
            await guildDB.create(latestVideo);
            return announceableStream;
          }
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
    return;
  } catch(err: any) {
    return err.message;
  }
}

export const makeAnnouncement = async (videoID: string): Promise<AnnouncementEmbed> => {
  let id = videoID;
  id = id.replace('yt:video:', '');
  let videoInfo = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.YTAPI}`);
  const videoInfojson = await videoInfo.json();
  const videoInformation = videoInfojson.items[0].snippet;
  const dog: string = videoInformation.pulishedAt;
  let channelPFP = await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${videoInfojson.items[0].snippet.channelId}&key=${process.env.YTAPI}`);
  const channelInfo = await channelPFP.json();
  const announcementEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(videoInformation.title)
    .setURL('https://www.youtube.com/watch?v=' + id)
    .setAuthor({
      name: videoInformation.channelTitle,
      iconURL: channelInfo.items[0].snippet.thumbnails.default.url,
      url: `https://www.youtube.com/channel/${channelInfo.items[0].id}`
    })
    .setDescription(videoInformation.description.slice(0, 200))
    .setThumbnail(channelInfo.items[0].snippet.thumbnails.high.url)
    .setImage(videoInformation.thumbnails.high.url)
    .setTimestamp()
    .setFooter({ text: `${videoInformation.publishedAt}` });
  return {
    content: `${videoInformation.channelTitle} is live at https://www.youtube.com/watch?v=${id}`,
    embeds: [announcementEmbed]
  };
}

const queryLiveStream = async (db: mongoose.Model<Video, {}, {}, {}>, channelID: string) : Promise<void | AnnouncementEmbed> => {
  const response = await fetch(`https://youtube.com/channel/${channelID}/live`);
  const text = await response.text();
  const html = parse(text);
  const canonicalURLTag = html.querySelector('link[rel=canonical]');
  const canonicalURL = canonicalURLTag?.getAttribute('href');
  let resultLink: string;
  if (canonicalURL && canonicalURL.includes('/watch?v=')) {
    const ytInfoString = await infoStringExamine(canonicalURL!);
    if(ytInfoString?.includes('Started')) {
      resultLink = canonicalURL!;
      const stream = await db.findOne({
        link: resultLink
      })
      if(!stream) {
        const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`);
        for(let i = 0; i < feed.items.length; i++) {
          if(feed.items[i].id.replace('yt:video:', '') === resultLink.replace('https://www.youtube.com/watch?v=', '')) {
            feed.items[i].authorID = channelID;
            await db.create(feed.items[i]);
            const embed = await makeAnnouncement(feed.items[i].id);
            return embed;
          }
        }
      }
    } else {
      resultLink = `https://www.youtube.com/channel/${channelID}`;
    }
  } else {
    resultLink = `https://www.youtube.com/channel/${channelID}`;
  }
}

export const infoStringExamine = async (url: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox, --single-process', '--no-zygote']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080});
  await page.goto(url);
  await page.waitForSelector('#info-strings');
  let ytInfoString = await page.evaluate(()=> {
    let info = document.querySelector('#info-strings > yt-formatted-string');
    return (info ? info.textContent : 'Nothing')
  })
  await browser.close();
  return ytInfoString;
}

export const getIDFromLink = async (name: string) => {
  if(name.charAt(0) === 'U') {
    return name;
  }
  if(name.includes('/user/')) {
    name = name.replace('Https://www.youtube.com/user/', '');
    const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${name}&key=${process.env.YTAPI}`);
    const respJson = await response.json();
    name = respJson.items[0].id;
    return name;
  }
  if(name.includes('/c/')) {
    name = name!.charAt(0).toLowerCase() + name!.slice(1);
    name = name + '/videos'
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox, --single-process', '--no-zygote']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080});
    await page.goto(name);
    let latestLink = await page.evaluate(()=> {
      let info = document.querySelector('#video-title');
      return (info ? (info as HTMLAnchorElement).href : 'Nothing')
    })
    latestLink = latestLink.replace('https://www.youtube.com/watch?v=', '');
    if(latestLink.includes('shorts')) {
      return 'shorts';
    }
    const response = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${latestLink}&key=${process.env.YTAPI}`);
    const respJson = await response.json();
    name = respJson.items[0].snippet.channelId;
    await browser.close();
    return name;
  }
  if(name.includes('/channel/')) {
    name = name.replace('Https://www.youtube.com/channel/', '');
    return name;
  }
  return name;
}