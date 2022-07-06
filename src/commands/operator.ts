import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
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
        let name = interaction.options.getString('name');
        name = name!.replaceAll(' ', '-');
        const data: Operator | { error: 'Operator not found' } = await getOperatorData(name);
        if (Object.keys(data).includes('error')) {
          await interaction.deleteReply();
          await interaction.followUp({
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
    } catch (err) {
      if (interaction.isCommand()) {
        await interaction.deleteReply();
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  },
};
