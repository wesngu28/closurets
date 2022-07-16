import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import { deleteAndFollowUp } from '../helpers/deleteAndFollowUp';
import { Command } from '../types/Command';
import { Operator } from '../types/Operator';
import { assembleButtons } from '../helpers/operator/assembleButtons';
import { formulateResponse } from '../helpers/operator/formulateResponse';
import { getOperatorData } from '../helpers/operator/getOperatorData';
import { skinPaginator } from '../helpers/operator/skinPaginator';

export const operator: Command = {
  data: new SlashCommandBuilder()
    .setName('operator')
    .setDescription('Replies with your input!')
    .addStringOption(option =>
      option.setName('name').setDescription('Rhodes Island Operator').setRequired(true)
    ),
  async execute(interaction: Interaction) {
    try {
      if (interaction.isCommand()) {
        await interaction.deferReply();
        const name = interaction.options.getString('name')!.replaceAll(' ', '-');
        const data: Operator | { error: 'Operator not found' } = await getOperatorData(name);
        if (Object.keys(data).includes('error')) {
          deleteAndFollowUp(interaction, 'You provided an incorrect operator name.');
        } else {
          const imgList: { [key: string]: string } = (data as Operator).art;
          const buttons = assembleButtons(imgList);
          const embed = formulateResponse(data as Operator);
          await skinPaginator(interaction, embed, buttons, imgList, 120000);
        }
      }
    } catch (err) {
      if (interaction.isCommand()) {
        deleteAndFollowUp(interaction, 'There was an error while executing this command!');
      }
    }
  },
};
