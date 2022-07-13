import { parse } from 'node-html-parser';
import fetch from 'node-fetch';

export const findCanonical = async (channelID: string) => {
  const response = await fetch(`https://youtube.com/channel/${channelID}/live`);
  const text = await response.text();
  const html = parse(text);
  const liveLink = html.querySelector('link[rel=canonical]')?.getAttribute('href');
  return liveLink;
};
