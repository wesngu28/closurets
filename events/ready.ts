import { AnyChannel } from "discord.js";
import { Closure } from "../client/Closure";
import { AnnouncementEmbed, fetchLiveStream } from "../functions/youtube";
import config from '../config/config.json';

export const ready = async(BOT: Closure) => {
  console.log(`Bot ${BOT.user?.tag} is logged in!`);
  let channel: AnyChannel | null;
  try {
    if(config.track_channel.channel !== '') {
      channel = await BOT.channels.fetch(config.track_channel.channel);
      const channelID = config.track_channel.id;
      if(channel && channelID) {
        setInterval(() => {
          fetchLiveStream(channelID).then(async (data: AnnouncementEmbed | void) => {
              if (data !== undefined) {
                if(channel?.isText()) {
                  channel?.send(data)
                }
              }
          })
        }, 60 * 1000)
      }
    }
  } catch(err) {
    console.error;
  }
}