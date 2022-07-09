import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import fetch from 'node-fetch';
import { Command } from '../types/Command';

export const E2: Command = {
  data: new SlashCommandBuilder()
    .setName('e2')
    .setDescription('Get the e2 art of an operator.')
    .addStringOption(option =>
      option.setName('name').setDescription('Rhodes Island Operator').setRequired(true)
    ),
  async execute(interaction: Interaction) {
    try {
      if (interaction.isCommand()) {
        const name = interaction.options.getString('name')!.replace(' ', '-');
        const response = await fetch(`https://rhodesapi.herokuapp.com/api/rhodes/skins/e2/${name}`);
        const e2: { e2: string } = (await response.json()) as { e2: string };
        await interaction.reply(e2.e2);
      }
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
