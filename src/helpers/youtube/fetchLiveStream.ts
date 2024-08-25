import mongoose from 'mongoose';
import { VideoSchema } from '../../models/Video';
import { AnnouncementEmbed } from '../../types/AnnouncementEmbed';
import { makeAnnouncement } from './makeAnnouncement';
import { findLatestVideo } from './findLatestVideo';
import { publishedDate } from './publishedDate';
import { verifyLive } from './verifyLive';

export const fetchLiveStream = async (
  guildID: string,
  channelID: string,
  date: string
): Promise<null | AnnouncementEmbed> => {
  try {
    const guildDB = mongoose.model(`${guildID}`, VideoSchema);
    const latestVideo = await findLatestVideo(channelID);
    if (!latestVideo) return null;
    if (latestVideo.live === true) {
      const verification = await verifyLive(channelID);
      if (!verification || (verification && verification.live === false)) {
        return null;
      }
      const ensureNoDuplicate = await guildDB.findOne({ id: latestVideo.id });
      if (ensureNoDuplicate === null) {
        await guildDB.create(latestVideo);
        const announcement = await makeAnnouncement(latestVideo);
        return announcement;
      }
    }
    const ensureNoDuplicate = await guildDB.findOne({ id: latestVideo.id });
    if (ensureNoDuplicate === null) {
      const videoUploaded = await makeAnnouncement(latestVideo);
      const publishedAt = await publishedDate(channelID, latestVideo);
      if (publishedAt && publishedAt < date) {
        return null;
      }
      videoUploaded.content = `${videoUploaded.embeds[0].data.author!.name} has just uploaded ${
        latestVideo.title
      } ${latestVideo.link}`;
      await guildDB.create(latestVideo);
      return videoUploaded;
    }
    return null;
  } catch (err: any) {
    console.log(err)
    return null;
  }
};
