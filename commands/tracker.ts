import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, Interaction } from "discord.js";
import Tracker from "../models/Tracker";

export const configureTracker = {
  data: new SlashCommandBuilder()
  .setName('tracker')
	.setDescription('Configure channel to track and where to post.')
	.addStringOption(option => option.setName('channel').setDescription('Channel id (these are in /channel/ urls)').setRequired(true)),
	async execute(interaction: Interaction) {
    if(!interaction.isCommand()) {
      return;
    }
    interface Tracker {
      _id: string;
      channelID: string;
      ytID?: string;
    }
    const member = interaction.member as GuildMember;
    if(member!.permissions.has("ADMINISTRATOR") === false) {
      await interaction.reply({ content: 'You are not able to execute this command!', ephemeral: true });
      return;
    }
    const tracked = await Tracker.findOne(({ _id: interaction.guild!.id }));
    if (tracked) {
      tracked.ytID = interaction.options.getString('channel')!;
      await tracked.save();
      interaction.reply({content: `Now tracking activity from ${tracked.ytID}`, ephemeral: true})
    } else {
      const trackerObject: Tracker = {
        _id: interaction.guild!.id,
        channelID: interaction.channel!.id
      }
      trackerObject.ytID = interaction.options.getString('channel')!;
      await Tracker.create(trackerObject);
      interaction.reply({content: `Now tracking activity from ${trackerObject.ytID}`, ephemeral: true})
    }
	},
}