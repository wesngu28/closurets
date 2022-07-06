import { MessageEmbed } from 'discord.js';
import { parse } from 'node-html-parser';
import fetch from 'node-fetch';
import { chromium } from 'playwright-chromium';
import { getOrSetToCache } from '../../models/getOrSetToCache';
import { AnnouncementEmbed, EmbedInformation } from '../../types/AnnouncementEmbed';

export const makeAnnouncement = async (videoID: string): Promise<AnnouncementEmbed> => {
  let embedResponse = {} as EmbedInformation;
  let id = videoID;
  id = id.replace('yt:video:', '');
  if (process.env.YTAPI_USE === 'ALL') {
    embedResponse = await getOrSetToCache(`announcevideo?=${id}`, async () => {
      const embedInformation = {} as EmbedInformation;
      const videoInfo = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.YTAPI}`
      );
      const videoInfojson: any = await videoInfo.json();
      const videoInformation = videoInfojson.items[0].snippet;
      const channelPFP = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${videoInfojson.items[0].snippet.channelId}&key=${process.env.YTAPI}`
      );
      const channelInfo: any = await channelPFP.json();
      embedInformation.title = videoInformation.title;
      embedInformation.name = videoInformation.channelTitle;
      embedInformation.iconURL = channelInfo.items[0].snippet.thumbnails.default.url;
      embedInformation.url = channelInfo.items[0].id;
      embedInformation.description = videoInformation.description.slice(0, 200);
      embedInformation.thumbnail = channelInfo.items[0].snippet.thumbnails.high.url;
      embedInformation.image = videoInformation.thumbnails.high.url;
      embedInformation.id = channelInfo.items[0].id;
      embedInformation.publishedAt = videoInformation.publishedAt;
      return embedInformation;
    });
  }
  if (process.env.YTAPI_USE === 'MIN') {
    embedResponse = await getOrSetToCache(`announcevideo?=${id}`, async () => {
      const embedInformation = {} as EmbedInformation;
      const browser = await chromium.launchPersistentContext('/puppet', {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
      });
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`https://www.youtube.com/watch?v=${id}`);
      await page.waitForSelector('#container > h1 > yt-formatted-string');
      const scriptTag = await page.$('//*[@id="scriptTag"]');
      const content = JSON.parse(await page.evaluate(el => el!.innerHTML, scriptTag));
      const iconURL = await page.evaluate(() => {
        const twoSize = [];
        const element = document.querySelector('#avatar > #img');
        twoSize.push((element as HTMLImageElement).src.replace('s48', 's88'));
        twoSize.push((element as HTMLImageElement).src.replace('s48', 's800'));
        return twoSize;
      });
      const [small, large] = iconURL;

      const findChannelID = await fetch(`https://www.youtube.com/watch?v=${id}`);
      const text = await findChannelID.text();
      const html = parse(text);
      const itemProp = html.querySelector('meta[itemprop=channelId]');
      const channelID = itemProp?.getAttribute('content');

      const hqDefault = content.thumbnailUrl[0].replace('maxresdefault', 'hqdefault');

      embedInformation.title = content.name;
      embedInformation.name = content.author;
      embedInformation.iconURL = small;
      embedInformation.description = content.description.slice(0, 200);
      embedInformation.thumbnail = large;
      embedInformation.image = hqDefault;
      embedInformation.id = channelID!;

      const videoInfo = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.YTAPI}`
      );
      const videoInfojson: any = await videoInfo.json();
      const videoInformation = videoInfojson.items[0].snippet;
      embedInformation.publishedAt = videoInformation.publishedAt;

      await browser.close();
      return embedInformation;
    });
  }
  const announcementEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(embedResponse.title) // #container > h1 > yt-formatted-string
    .setURL(`https://www.youtube.com/watch?v=${id}`)
    .setAuthor({
      name: embedResponse.name, // #text > a
      iconURL: embedResponse.iconURL, // #avatar > # img
      url: `https://www.youtube.com/channel/${embedResponse.id}`, // #meta itemprop
    })
    .setDescription(embedResponse.description) // #content > #description.text()
    .setThumbnail(embedResponse.thumbnail) // link[itemprop="thumbnailUrl"]
    .setImage(embedResponse.image) // #avatar > # img
    .setTimestamp();
  return {
    content: `@everyone ${embedResponse.name} is live at https://www.youtube.com/watch?v=${id}`,
    embeds: [announcementEmbed],
    publishedDate: `${embedResponse.publishedAt}`,
  };
};
