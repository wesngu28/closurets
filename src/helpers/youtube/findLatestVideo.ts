import { chromium } from 'playwright-chromium';
import { Video } from '../../types/Video';
import trackerModel from '../../models/trackerModel';

export const findLatestVideo = async (channelID: string): Promise<Video> => {
  const tracked = await trackerModel.findOne({ ytID: channelID });
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`https://www.youtube.com/playlist?list=${tracked!.uploadsPlaylist}`);
  await page.waitForSelector('#video-title');
  const latestLink = await page.evaluate(() => {
    const info = document.querySelector('#video-title');
    return info ? (info as HTMLAnchorElement).href : 'no latest video found';
  });
  if (latestLink !== 'no latest video found') {
    const latestTitle = await page.evaluate(() => {
      const info = document.querySelector('#video-title')?.textContent!;
      return info;
    });
    await browser.close();
    return { title: latestTitle, link: latestLink };
  }
  await browser.close();
  return { title: 'no latest video', link: latestLink };
};
