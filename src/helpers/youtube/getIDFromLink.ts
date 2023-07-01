import { parse } from 'node-html-parser';

export const getIDFromLink = async (name: string): Promise<string | null> => {
  if (name.startsWith('U') && name.length === 24) return name;
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
    const scripts = document.querySelectorAll('script')
    let json: {[key: string]: any} = {}
    scripts.forEach(script => {
        if (script.textContent && script.textContent.includes('var ytInitialData')) {
            let fmt = script.textContent.replace('var ytInitialData = ', '').replace(';', '')
            json = JSON.parse(fmt)
        }
    })
    if (json) return json.header.c4TabbedHeaderRenderer.channelId || null
  }
  return null;
};
