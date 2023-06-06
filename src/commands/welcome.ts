
import { GuildMember, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import welcomeModel from '../models/welcomeModel';
import { Command } from '../types/Command';
import { Welcome } from '../types/Welcome';

export const configureWelcome: Command = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure welcome channel and image.')
    .addStringOption(option => option.setName('image').setDescription('Image url for welcomes')),
  async execute(interaction) {
    try {
      if (!interaction.isCommand()) return;
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
          content: 'You are not able to execute this command!',
          ephemeral: true,
        });
        return;
      }
      const guilded = await welcomeModel.findOne({ _id: interaction.guild!.id });
      if (guilded) {
        guilded.channelID = interaction.channel!.id;
        if (interaction.options.get('image')) {
          guilded.image = interaction.options.get('image')?.value?.toString()!;
        } else {
          guilded.image =
            'https://i.pinimg.com/originals/14/a5/de/14a5de56f19b4635b43f35805e3aa0aa.jpg';
        }
        guilded.save();
        interaction.reply({
          content: `Welcome configured to ${interaction.channel}. Image set to ${guilded.image}`,
          ephemeral: true,
        });
        return;
      }
      const welcomeObject = {
        _id: interaction.guild!.id,
        channelID: interaction.channel!.id,
      } as Welcome;
      if (interaction.options.get('image')) {
        welcomeObject.image = interaction.options.get('image')?.value?.toString()!;
      } else {
        welcomeObject.image =
          'https://i.pinimg.com/originals/14/a5/de/14a5de56f19b4635b43f35805e3aa0aa.jpg';
      }
      await welcomeModel.create(welcomeObject);
      interaction.reply({
        content: `Welcome configured to ${interaction.channel}. Image set to ${welcomeObject.image}`,
        ephemeral: true,
      });
    } catch (err) {
      if (interaction.isCommand()) {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  },
};
