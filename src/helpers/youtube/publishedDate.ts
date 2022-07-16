import fetch from 'node-fetch';
import { parseHTML, parseJSON } from '../../util/parserSnippets';
import { Video } from '../../types/Video';

export const publishedDate = async (channelID: string, video: Video): Promise<string | null> => {
  if (process.env.YTAPI) {
    const videoInfo = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${video.id}&key=${process.env.YTAPI}`
    );
    const videoInfojson: any = await videoInfo.json();
    const { publishedAt } = videoInfojson.items[0].snippet;
    return publishedAt;
  }
  const videoHTML = await parseHTML(video.link);
  const videoScripts = videoHTML.querySelectorAll('script');
  const videoJSON = await parseJSON(videoScripts);
  const { videoPrimaryInfoRenderer } =
    videoJSON.contents.twoColumnWatchNextResults.results.results.contents[0];
  if (videoPrimaryInfoRenderer.dateText.simpleText.includes('Streamed')) {
    return null;
  }
  return new Date(Date.now()).toISOString();
};
