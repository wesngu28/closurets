import { MessageButton } from 'discord.js';

export const assembleButtons = (imgList: { [key: string]: string }): Array<MessageButton> => {
  const names = Object.keys(imgList);
  const buttons = Object.keys(imgList).map((item, index) =>
    new MessageButton().setCustomId(`${index}`).setLabel(names[index]).setStyle('SECONDARY')
  );
  return buttons;
};
