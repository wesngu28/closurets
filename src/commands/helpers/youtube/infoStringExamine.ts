import { chromium } from 'playwright-chromium';

export const infoStringExamine = async (url: string) => {
  const browser = await chromium.launchPersistentContext('/puppet', {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url);
  await page.waitForSelector('#info-strings');
  const ytInfoString = await page.evaluate(() => {
    const info = document.querySelector('#info-strings > yt-formatted-string');
    return info ? info.textContent : 'Nothing';
  });
  await browser.close();
  return ytInfoString;
};
