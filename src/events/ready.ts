import { TextBasedChannel } from 'discord.js';
import { Tracker } from '../types/Tracker';
import { Closure } from '../client/Closure';
import { fetchLiveStream } from '../helpers/youtube/fetchLiveStream';
import trackerModel from '../models/trackerModel';
import { DiscordEvent } from '../types/DiscordEvent';

async function liveChecker(client: Closure) {
  const allTrackedGuilds = await trackerModel.find();
  if (allTrackedGuilds[0]) {
    allTrackedGuilds.forEach(async (guild: Tracker) => {
      const data = await fetchLiveStream(guild._id, guild.ytID!, client.runDate);
      const channel = client.channels.cache.get(guild.channelID) as TextBasedChannel;
      if (data) {
        channel.send({
          content: `@everyone ${data.content}`,
          embeds: data.embeds,
        });
      }
    });
  }
}

export const ready: DiscordEvent = {
  name: 'ready',
  async execute(client: Closure): Promise<void> {
    if (!client.user) return;
    if (process.env.NODE_ENV === 'development')
      console.log(`Bot ${client.user.tag} is logged in at ${client.runDate}!`);
    client.user.setPresence({ activities: [{ name: 'Selling Originite Prime' }] });
    await liveChecker(client);
    setInterval(async () => {
      await liveChecker(client);
    }, 60 * 1000);
  },
};
