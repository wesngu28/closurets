import { Page } from 'playwright-chromium';
import { Video } from '../../types/Video';
import trackerModel from '../../models/trackerModel';

export const findLatestVideo = async (channelID: string, page: Page): Promise<Video> => {
  const tracked = await trackerModel.findOne({ ytID: channelID });
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
    return { title: latestTitle, link: latestLink };
  }
  return { title: 'no latest video', link: latestLink };
};
