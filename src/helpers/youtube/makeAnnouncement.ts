import { EmbedBuilder } from 'discord.js';
import { HolodexVideo } from '../../types/HolodexVideo';
import { Video } from '../../types/Video';
// import { getOrSetToCache } from '../../models/getOrSetToCache';
import { AnnouncementEmbed, EmbedInformation } from '../../types/AnnouncementEmbed';
import { parseHTML, parseJSON } from '../../util/parserSnippets';

export const makeAnnouncement = async ({
  id,
  title,
}: Video | HolodexVideo): Promise<AnnouncementEmbed> => {
  const videoHTML = await parseHTML(`https://www.youtube.com/watch?v=${id}`);
  const videoScripts = videoHTML.querySelectorAll('script');
  const videoJSON = await parseJSON(videoScripts);
  const { videoSecondaryInfoRenderer } =
    videoJSON.contents.twoColumnWatchNextResults.results.results.contents[1];
  const { videoOwnerRenderer: vOR } = videoSecondaryInfoRenderer.owner;
  const pieceDescriptionTogether = [];
  if (videoSecondaryInfoRenderer.description) {
    for (const run of videoSecondaryInfoRenderer.description.runs) {
      pieceDescriptionTogether.push(run.text);
    }
  }
  const embed: EmbedInformation = {
      title,
      name: vOR.title.runs[0].text,
      iconURL: vOR.thumbnail.thumbnails[1].url,
      description: pieceDescriptionTogether.join('').slice(0, 200),
      thumbnail: vOR.thumbnail.thumbnails[1].url.replace('88', '800'),
      image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      id: vOR.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
  };
  const announcementEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(embed.title)
    .setURL(`https://www.youtube.com/watch?v=${id}`)
    .setAuthor({
      name: embed.name,
      iconURL: embed.iconURL,
      url: `https://www.youtube.com/channel/${embed.id}`,
    })
    .setDescription(embed.description ? embed.description : 'No description')
    .setThumbnail(embed.thumbnail)
    .setImage(embed.image)
    .setTimestamp();
  return {
    content: `${embed.name} is live at https://www.youtube.com/watch?v=${id}`,
    embeds: [announcementEmbed],
  };
};
