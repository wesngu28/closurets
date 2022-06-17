import { Guild } from 'discord.js';
import fs from 'fs';
import config from '../config/config.json';

export const guildCreate = async (guild: Guild) => {
  const channel = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me!).has('SEND_MESSAGES'));
  if(channel) {
    if(channel?.isText()) {
      channel?.send("What can I get for you, Doc?")
    }
    if (config.default.welcome_channel === '') {
      config.default.welcome_channel = channel.id;
      fs.writeFile('./config.json', JSON.stringify(config), (err) => {
        if (err)
          console.log(err);
        else {
          console.log('Config written');
        }
      })
    }
  }
}