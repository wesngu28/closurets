import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

export const parseHTML = async (url: string) => {
  const response = await fetch(url);
  const text = await response.text();
  const html = parse(text);
  return html;
};

export const parseJSON = async (scriptList: any[]) => {
  for (const script of scriptList) {
    if ((script as HTMLScriptElement).text.includes('ytInitialData')) {
      const removedVar = (script as HTMLScriptElement).text.replace('var ytInitialData = ', '');
      const removeSemiColons = removedVar.replaceAll(';', '');
      return JSON.parse(removeSemiColons);
    }
  }
  return null;
};
