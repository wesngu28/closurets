import puppeteer from 'puppeteer';

export const infoStringExamine = async (url: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: './puppet',
    args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url);
  await page.waitForSelector('#info-strings');
  const ytInfoString = await page.evaluate(() => {
    const info = document.querySelector('#info-strings > yt-formatted-string');
    return info ? info.textContent : 'Nothing';
  });
  await browser.close();
  return ytInfoString;
};
