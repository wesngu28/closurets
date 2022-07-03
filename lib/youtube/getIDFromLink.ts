import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

export const getIDFromLink = async (name: string): Promise<string> => {
  if (name.startsWith('U') && name.length === 24) {
    return name;
  }
  const validate = /^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/;
  if (validate.test(name)) {
    if (name.includes('/user/')) {
      let username = name!.charAt(0).toLowerCase() + name!.slice(1);
      username = name.replace('https://www.youtube.com/user/', '');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${username}&key=${process.env.YTAPI}`
      );
      const respJson: any = await response.json();
      username = respJson.items[0].id;
      return username;
    }
    if (name.includes('/c/')) {
      let channelID = name!.charAt(0).toLowerCase() + name!.slice(1);
      channelID += '/videos';
      const browser = await puppeteer.launch({
        headless: true,
        userDataDir: './puppet',
        args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(channelID);
      await page.waitForFunction("document.querySelector('h3 > #video-title')");
      let latestLink = await page.evaluate(() => {
        const info = document.querySelector('h3 > #video-title');
        return info ? (info as HTMLAnchorElement).href : 'Nothing';
      });
      latestLink = latestLink.replace('https://www.youtube.com/watch?v=', '');
      if (latestLink.includes('shorts')) {
        return 'shorts';
      }
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${latestLink}&key=${process.env.YTAPI}`
      );
      const respJson: any = await response.json();
      channelID = respJson.items[0].snippet.channelId;
      await browser.close();
      return channelID;
    }
    if (name.includes('/channel/')) {
      let id = name!.charAt(0).toLowerCase() + name!.slice(1);
      id = name.replace('https://www.youtube.com/channel/', '');
      return id;
    }
    return 'You provided an invalid link';
  }
  return 'You provided an invalid link';
};
