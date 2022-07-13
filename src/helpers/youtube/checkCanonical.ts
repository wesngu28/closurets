import { parse } from 'node-html-parser';

export const checkCanonical = async (channelID: string) => {
  const response = await fetch(`https://youtube.com/channel/${channelID}/live`);
  const text = await response.text();
  const html = parse(text);
  const canonicalURLTag = html.querySelector('link[rel=canonical]')!.getAttribute('href');
  return canonicalURLTag;
};
