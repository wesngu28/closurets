import { Closure } from "../client/Closure";
import { fetchLiveStream } from "../functions/youtube";
import Tracker from "../models/Tracker";

export const ready = async(client: Closure) => {
  console.log(`Bot ${client.user?.tag} is logged in!`);
  client.user?.setPresence({activities: [{name: 'Selling Originite Prime'}]});
  try {
    setInterval(() => {
      const guilds = client.guilds.cache.map(guild => guild.id);
      guilds.forEach(async (guild) => {
        const tracked = await Tracker.findOne(({ _id: guild }));
        if(tracked !== null) {
          const channel = client.channels.cache.get(tracked!.channelID);
          fetchLiveStream(guild, tracked.ytID!).then(async (data) => {
            if (data !== undefined) {
              if(channel?.isText()) {
                channel?.send(data);
              }
            }
        })
        }
      });
    }, 60 * 1000)
    return;
  } catch(err) {
    console.error;
  }
}