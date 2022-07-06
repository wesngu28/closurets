import mongoose from 'mongoose';
import { VideoSchema } from '../../../models/Video';
import { AnnouncementEmbed } from '../../../types/AnnouncementEmbed';
import { Video } from '../../../types/Video';
import { findLatestVideo } from './findLatestVideo';
import { queryLiveStream } from './queryLiveStream';
/* eslint consistent-return: off */

export const fillChannelCollection = async (
  guildID: string,
  channelID: string
): Promise<void | AnnouncementEmbed> => {
  try {
    const guildDB = mongoose.model(`${guildID}`, VideoSchema);
    await guildDB.deleteMany({ authorID: { $ne: channelID } });
    const latestVideo = await findLatestVideo(channelID);
    const preRunAnnounceableStream = await queryLiveStream(guildDB, channelID);
    if (preRunAnnounceableStream) {
      return preRunAnnounceableStream;
    }
    if (latestVideo !== 'no latest video found') {
      const newDBVideo = latestVideo as Video;
      newDBVideo.authorID = channelID;
      await guildDB.create(newDBVideo);
    }
  } catch (err: any) {
    console.log(err.message);
  }
};
