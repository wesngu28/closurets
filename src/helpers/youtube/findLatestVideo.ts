import { Page } from 'playwright-chromium';
import { Video } from '../../types/Video';
import trackerModel from '../../models/trackerModel';

export const findLatestVideo = async (channelID: string, page: Page): Promise<Video | null> => {
  const tracked = await trackerModel.findOne({ ytID: channelID });
  await page.goto(`https://www.youtube.com/playlist?list=${tracked!.uploadsPlaylist}`);
  await page.waitForSelector('#video-title');
  const isItUpcoming = await page.evaluate((): boolean => {
    const timeStatus = document.querySelector(
      '#overlays > ytd-thumbnail-overlay-time-status-renderer > #text'
    )?.textContent;
    if (timeStatus?.includes('UPCOMING')) return true;
    return false;
  });
  if (isItUpcoming) return null;
  const latestLink = await page.evaluate(() => {
    const info = document.querySelector('#video-title');
    return info ? (info as HTMLAnchorElement).href : null;
  });
  if (latestLink) {
    const latestTitle = await page.evaluate(() => {
      const info = document.querySelector('#video-title')?.textContent!;
      return info;
    });
    return { title: latestTitle, link: latestLink };
  }
  return null;
};
