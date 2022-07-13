import { Page } from 'playwright-chromium';

export const infoStringExamine = async (url: string, page: Page) => {
  if (url && url.includes('/watch?v=')) {
    await page.goto(url);
    await page.waitForSelector('#info-strings');
    const ytInfoString = await page.evaluate(() => {
      const info = document.querySelector('#info-strings > yt-formatted-string');
      return info ? info.textContent : 'Nothing';
    });
    return ytInfoString;
  }
  return 'Nothing';
};
