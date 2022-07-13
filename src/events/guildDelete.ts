import { Guild } from 'discord.js';
import mongoose from 'mongoose';
import welcomeModel from '../models/welcomeModel';
import { VideoSchema } from '../models/Video';
import trackerModel from '../models/trackerModel';
import { DiscordEvent } from '../types/DiscordEvent';

export const guildDelete: DiscordEvent = {
  name: 'guildDelete',
  async execute(guild: Guild): Promise<void> {
    const guildDB = mongoose.model(`${guild.id}`, VideoSchema);
    await guildDB.collection.drop();
    await welcomeModel.deleteOne({ _id: guild.id });
    await trackerModel.deleteOne({ _id: guild.id });
  },
};
