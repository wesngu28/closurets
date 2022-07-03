import { fetchLiveStream } from '../../lib/youtube/fetchLiveStream';
import { Closure } from '../client/Closure';
import trackerModel from '../models/trackerModel';
import { DiscordEvent } from '../types/DiscordEvent';

const currentDate = new Date(Date.now()).toISOString();

export const ready: DiscordEvent = {
  name: 'ready',
  async execute(client: Closure): Promise<void> {
    if (!client.user) return;
    console.log(`Bot ${client.user.tag} is logged in!`);
    client.user.setPresence({ activities: [{ name: 'Selling Originite Prime' }] });
    try {
      setInterval(() => {
        const guilds = client.guilds.cache.map(guild => guild.id);
        guilds.forEach(async (guild: string) => {
          const tracked = await trackerModel.findOne({ _id: guild });
          if (tracked !== null) {
            const channel = client.channels.cache.get(tracked.channelID);
            fetchLiveStream(guild, tracked.ytID!, currentDate).then(async data => {
              if (data) {
                if (channel) {
                  if (channel.isText()) {
                    if (data) {
                      channel.send(data);
                    }
                  }
                }
              }
            });
          }
        });
      }, 60 * 1000);
      return;
    } catch (err) {
      console.log('mistake');
    }
  },
};
