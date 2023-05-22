import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';
import { Art } from 'types/Operator';

export const assembleButtons = (imgList: Array<Art>): Array<ButtonBuilder> => {
  const buttons = imgList.map((item, index) =>
    new ButtonBuilder().setCustomId(`${index}`).setLabel(item.name).setStyle(ButtonStyle.Secondary)
  );
  return buttons;
};
