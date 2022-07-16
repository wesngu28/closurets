import { parseHTML, parseJSON } from '../../util/parserSnippets';
import { Video } from '../../types/Video';
import { verifyLive } from './verifyLive';

export const findLatestVideo = async (channelID: string): Promise<Video | null> => {
  // const channelHTML = await parseHTML(`https://youtube.com/channel/${channelID}`);
  // const channelScripts = channelHTML.querySelectorAll('script');
  // const channelJSON = await parseJSON(channelScripts);
  // if (!channelJSON) return null;
  // let uploadsPlaylist: string | null = null;
  // for (const content of channelJSON.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
  //   .content.sectionListRenderer.contents) {
  //   if (content.itemSectionRenderer.contents[0].shelfRenderer) {
  //     if (content.itemSectionRenderer.contents[0].shelfRenderer.title.runs[0].text === 'Uploads')
  //       uploadsPlaylist =
  //         content.itemSectionRenderer.contents[0].shelfRenderer.playAllButton.buttonRenderer
  //           .navigationEndpoint.watchEndpoint.playlistId;
  //   }
  // }
  // if (!uploadsPlaylist) return null;
  // Big ups to https://webapps.stackexchange.com/a/113913
  const uploadsPlaylist = channelID.replace('UC', 'UU');
  const playlistHTML = await parseHTML(`https://www.youtube.com/playlist?list=${uploadsPlaylist}`);
  const playlistScripts = playlistHTML.querySelectorAll('script');
  const playlistJSON = await parseJSON(playlistScripts);
  const videoLocation =
    playlistJSON.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
      .sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer
      .contents[0];
  if (
    videoLocation.playlistVideoRenderer.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer.text
      .simpleText === 'UPCOMING'
  )
    return null;
  let liveStatus = true;
  if (
    videoLocation.playlistVideoRenderer.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer.text
      .simpleText
  )
    liveStatus = false;
  const verification = await verifyLive(channelID);
  if (verification && liveStatus === false) {
    return verification;
  }
  return {
    title: videoLocation.playlistVideoRenderer.title.runs[0].text,
    link: `https://www.youtube.com/watch?v=${videoLocation.playlistVideoRenderer.videoId}`,
    live: liveStatus,
    id: videoLocation.playlistVideoRenderer.videoId,
  };
};
