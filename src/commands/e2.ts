import { SlashCommandBuilder } from 'discord.js';
import { Command } from 'types/Command';

export const E2: Command = {
  data: new SlashCommandBuilder()
    .setName('e2')
    .setDescription('Get the e2 art of an operator.')
    .addStringOption(option =>
      option.setName('name').setDescription('Rhodes Island Operator').setRequired(true)
    ),
  async execute(interaction) {
    try {
      const name = interaction.options.get('name')!.value?.toString().replace(' ', '-');
      const response = await fetch(`https://rhodesapi.up.railway.app/api/${name}`);
      const e2: { e2: string } = (await response.json()) as { e2: string };
      await interaction.reply(e2.e2);
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
