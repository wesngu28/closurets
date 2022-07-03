import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import { assembleButtons } from '../../lib/embed/assembleButtons';
import { formulateResponse } from '../../lib/embed/formulateResponse';
import { skinPaginator } from '../../lib/embed/skinPaginator';
import { getOperatorData } from '../../lib/rhodes/getOperatorData';
import { Command } from '../types/Command';
import { Operator } from '../types/Operator';

export const operator: Command = {
  data: new SlashCommandBuilder()
    .setName('operator')
    .setDescription('Replies with your input!')
    .addStringOption(option =>
      option.setName('name').setDescription('Rhodes Island Operator').setRequired(true)
    ),
  async execute(interaction: Interaction) {
    if (interaction.isCommand()) {
      let name = interaction.options.getString('name');
      name = name!.replaceAll(' ', '-');
      const data: Operator | { error: 'Operator not found' } = await getOperatorData(name);
      if (Object.keys(data).includes('error')) {
        await interaction.reply({
          content: 'Something went wrong with the operator name you specified.',
          ephemeral: true,
        });
      } else {
        const imgList: { [key: string]: string } = (data as Operator).art;
        const buttons = assembleButtons(imgList);
        const embed = formulateResponse(data as Operator);
        const timeout = 120000;
        await skinPaginator(interaction, embed, buttons, imgList, timeout);
      }
    }
  },
};
