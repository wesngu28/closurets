import { parse } from 'node-html-parser';
import { Video } from '../../types/Video';
import { parseHTML, parseJSON } from '../../util/parserSnippets';

export const verifyLive = async (channelID: string): Promise<Video | null> => {
  const response = await fetch(`https://youtube.com/channel/${channelID}/live`);
  const text = await response.text();
  const html = parse(text);
  const liveLink = html.querySelector('link[rel=canonical]')!.getAttribute('href')!;
  if (liveLink && liveLink.includes('/watch?v=')) {
    const liveVideoHTML = await parseHTML(liveLink);
    const allScripts = liveVideoHTML.querySelectorAll('script');
    const videoJSON = await parseJSON(allScripts);
    const { videoPrimaryInfoRenderer } =
      videoJSON.contents.twoColumnWatchNextResults.results.results.contents[0];
    const titleLiveArr = [];
    titleLiveArr.push(videoPrimaryInfoRenderer.title.runs[0].text);
    if (
      videoPrimaryInfoRenderer.viewCount.videoViewCountRenderer.isLive &&
      videoPrimaryInfoRenderer.viewCount.videoViewCountRenderer.viewCount.runs[1].text.includes(
        'watching'
      )
    )
      titleLiveArr.push(true);
    else {
      titleLiveArr.push(false);
    }
    if (titleLiveArr.length === 0) return null;
    const [title, liveStatus] = titleLiveArr;
    const video: Video = {
      title: title!,
      link: liveLink,
      live: liveStatus,
      id: liveLink.replace('https://www.youtube.com/watch?v=', ''),
    };
    return video;
  }
  return null;
};
