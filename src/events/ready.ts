import { TextBasedChannel } from 'discord.js';
import { Tracker } from '../types/Tracker';
import { Closure } from '../client/Closure';
import { fetchLiveStream } from '../helpers/youtube/fetchLiveStream';
import trackerModel from '../models/trackerModel';
import { DiscordEvent } from '../types/DiscordEvent';
import { AnnouncementEmbed } from '../types/AnnouncementEmbed';
import { PermissionsBitField  } from 'discord.js';

async function liveChecker(client: Closure) {
  const allTrackedGuilds = await trackerModel.find();
  if (allTrackedGuilds[0]) {
    await Promise.all(
      allTrackedGuilds.map(async (guild: Tracker) => {
        let data = await fetchLiveStream(guild._id, guild.ytID!, client.runDate);
        if (data) {
          const channel = client.channels.cache.get(guild.channelID) as TextBasedChannel;
          const guilde = client.guilds.cache.get(guild._id)
          if (guilde && guilde.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
            channel.send({
              content: `@everyone ${data.content}`,
              embeds: data.embeds,
            });
          }
        }
        data = {} as AnnouncementEmbed;
      })
    );
  }
}

export const ready: DiscordEvent = {
  name: 'ready',
  async execute(client: Closure): Promise<void> {
    if (!client.user) return;
    if (process.env.NODE_ENV === 'development')
      console.log(`Bot ${client.user.tag} is logged in at ${client.runDate}!`);
    client.user.setPresence({ activities: [{ name: 'https://closurets.vercel.app/' }] });
    await liveChecker(client);
    setInterval(async () => {
      await liveChecker(client);
    }, 60 * 1000);
  },
};
