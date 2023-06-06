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
    console.log(latestVideo + " latest video")
    if (!latestVideo) return null;
    if (latestVideo.live === true) {
      const verification = await verifyLive(channelID);
      console.log(verification + " verification")
      if (!verification || (verification && verification.live === false)) {
        return null;
      }
      const ensureNoDuplicate = await guildDB.findOne({ id: latestVideo.id });
      console.log(ensureNoDuplicate + " ensureNoDuplicate")
      if (ensureNoDuplicate === null) {
        await guildDB.create(latestVideo);
        const announcement = await makeAnnouncement(latestVideo);
        return announcement;
      }
    }
    const ensureNoDuplicate = await guildDB.findOne({ id: latestVideo.id });
    console.log(ensureNoDuplicate + " ensureNoDuplicate outside of if")
    if (ensureNoDuplicate === null) {
      const videoUploaded = await makeAnnouncement(latestVideo);
      console.log(videoUploaded + " videoUploaded")
      const publishedAt = await publishedDate(channelID, latestVideo);
      console.log(publishedAt + " publishedAt")
      if (publishedAt && publishedAt < date) {
        return null;
      }
      videoUploaded.content = `${videoUploaded.embeds[0].data.author!.name} has just uploaded ${
        latestVideo.title
      } ${latestVideo.link}`;
      await guildDB.create(latestVideo);
      console.log(videoUploaded)
      return videoUploaded;
    }
    return null;
  } catch (err: any) {
    console.log(err)
    return null;
  }
};
