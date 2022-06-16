import { MessageEmbed } from 'discord.js';
import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import Video from '../models/Video';
let parser = new Parser();

export type AnnouncementEmbed = {
  content: string;
  embeds: MessageEmbed[];
}

export async function fetchLiveStream(channelID: string): Promise<void | AnnouncementEmbed> {
  try {
    await Video.deleteMany( { authorID: { "$ne": channelID}});
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`);
    const addFeed = await Video.find();
    if(addFeed.length === 0) {
      const videos = feed.items;
      videos.forEach(async(video) => {
        video.authorID = channelID;
        video.announced = false;
        await Video.create(video);
      })
    }
    const announceableStream = await queryLiveStream(channelID);
    if(announceableStream) {
      return announceableStream;
    }
    if(addFeed.length > 0) {
      const checkLatestVideo = await Video.findOne({ title: feed.items[0].title });
      if(checkLatestVideo === null) {
        const latestVideo = feed.items[0];
        const announceableStream = await makeAnnouncement(latestVideo.id);
        latestVideo.authorID = channelID;
        if(latestVideo.link === undefined) {
          return;
        }
        const ytInfoString = await infoStringExamine(latestVideo.link);
        if((ytInfoString?.includes('Started') || ytInfoString?.includes('watching now')) && !ytInfoString?.includes('Scheduled') && announceableStream) {
          return announceableStream;
        }
        announceableStream.content = `@everyone ${latestVideo.author} has just uploaded ${latestVideo.title} ${latestVideo.link}`;
        return announceableStream;
      }
    }
    return;
  } catch(err: any) {
    return err.message;
  }
}

export const makeAnnouncement = async (videoID: string): Promise<AnnouncementEmbed> => {
  let videoInfo = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID.replace('yt:video:', '')}&key=${process.env.YTAPI}`);
  const videoJson = await videoInfo.json();
  let channelInfo = await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${videoJson.items[0].snippet.channelId}&key=${process.env.YTAPI}`);
  const channelJson = await channelInfo.json();
  const embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(videoJson.title)
    .setURL(`https://www.youtube.com/watch?v=${videoID}`)
    .setAuthor({
      name: videoJson.channelTitle,
      iconURL: channelJson.items[0].snippet.thumbnails.default.url,
      url: `https://www.youtube.com/channel/${channelJson.items[0].id}`,
    })
    .setDescription(videoJson.description.slice(0, 200))
    .setThumbnail(channelJson.items[0].snippet.thumbnails.high.url)
    .setImage(videoJson.thumbnails.high.url)
    .setTimestamp();
  return {
    content: `${videoJson.channelTitle} is live at https://www.youtube.com/watch?v=${videoID}`,
    embeds: [embed]
  };
}

const queryLiveStream = async (channelID: string) : Promise<void | AnnouncementEmbed> => {
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
      const stream = await Video.findOne({
        link: resultLink
      })
      if(stream && stream.announced === false) {
        stream.announced = true;
        await stream.save();
        const embed = await makeAnnouncement(stream.id);
        return embed;
      }
    } else {
      resultLink = `https://www.youtube.com/channel/${channelID}`;
    }
  } else {
    resultLink = `https://www.youtube.com/channel/${channelID}`;
  }
}

async function infoStringExamine(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });

  //Visit the page and wait for info strings.
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080});
  await page.goto(url);
  await page.waitForSelector('#info-strings');
  let ytInfoString = await page.evaluate(()=> {
    let info = document.querySelector('#info-strings > yt-formatted-string');
    return (info ? info.textContent : 'Nothing')
  })
  return ytInfoString;
}