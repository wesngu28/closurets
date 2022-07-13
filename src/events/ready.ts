import { TextBasedChannel } from 'discord.js';
import { chromium } from 'playwright-chromium';
import { Tracker } from '../types/Tracker';
import { Closure } from '../client/Closure';
import { fetchLiveStream } from '../helpers/youtube/fetchLiveStream';
import trackerModel from '../models/trackerModel';
import { DiscordEvent } from '../types/DiscordEvent';
import { AnnouncementEmbed } from '../types/AnnouncementEmbed';

async function liveChecker(client: Closure) {
  const allTrackedGuilds = await trackerModel.find();
  if (allTrackedGuilds[0]) {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox, --single-process', '--no-zygote'],
    });
    console.log(browser.isConnected());
    const context = await browser.newContext();
    allTrackedGuilds.forEach(async (guild: Tracker) => {
      let data = await fetchLiveStream(guild._id, guild.ytID!, client.runDate, context);
      if (data) {
        const channel = client.channels.cache.get(guild.channelID) as TextBasedChannel;
        channel.send({
          content: `@everyone ${data.content}`,
          embeds: data.embeds,
        });
      }
      data = {} as AnnouncementEmbed;
      await context.close();
    });
    await browser.close();
    console.log(browser.isConnected());
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
