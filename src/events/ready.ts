import { Closure } from '../client/Closure';
import { fetchLiveStream } from '../helpers/youtube/fetchLiveStream';
import trackerModel from '../models/trackerModel';
import { DiscordEvent } from '../types/DiscordEvent';

export const ready: DiscordEvent = {
  name: 'ready',
  async execute(client: Closure): Promise<void> {
    if (!client.user) return;
    if (process.env.NODE_ENV === 'development')
      console.log(`Bot ${client.user.tag} is logged in at ${client.runDate}!`);
    client.user.setPresence({ activities: [{ name: 'Selling Originite Prime' }] });
    setInterval(() => {
      const guilds = client.guilds.cache.map(guild => guild.id);
      guilds.forEach(async (guild: string) => {
        const tracked = await trackerModel.findOne({ _id: guild });
        if (tracked !== null) {
          const channel = client.channels.cache.get(tracked.channelID);
          fetchLiveStream(guild, tracked.ytID!, client.runDate).then(async data => {
            if (data) {
              if (channel) {
                if (channel.isText()) {
                  if (data) {
                    channel.send({
                      content: `@everyone ${data.content}`,
                      embeds: data.embeds,
                    });
                  }
                }
              }
            }
          });
        }
      });
    }, 60 * 1000);
  },
};
