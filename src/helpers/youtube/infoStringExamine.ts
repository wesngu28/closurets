import { Page } from 'playwright-chromium';
import { sleep } from '../../util/sleep';

export const infoStringExamine = async (url: string, page: Page): Promise<string | null> => {
  if (url && url.includes('/watch?v=')) {
    await page.goto(url);
    await sleep(500);
    const ytInfoString = await page.evaluate(() => {
      const info = document.querySelector('#info-strings > yt-formatted-string');
      return info ? info.textContent : null;
    });
    return ytInfoString;
  }
  return null;
};
