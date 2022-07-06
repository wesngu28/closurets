import { parse } from 'node-html-parser';
import fetch from 'node-fetch';

export const getIDFromLink = async (name: string): Promise<string> => {
  if (name.startsWith('U') && name.length === 24) {
    return name;
  }
  const validate = /^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/;
  if (validate.test(name)) {
    if (name.includes('/channel/')) {
      let id = name!.charAt(0).toLowerCase() + name!.slice(1);
      id = name.replace('https://www.youtube.com/channel/', '');
      return id;
    }
    const response = await fetch(`${name}`);
    const text = await response.text();
    const html = parse(text);
    const itemProp = html.querySelector('meta[itemprop=channelId]');
    const channelID = itemProp?.getAttribute('content');
    return channelID || 'You provided an invalid link';
  }
  return 'You provided an invalid link';
};
