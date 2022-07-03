import { MessageButton } from 'discord.js';

export const assembleButtons = (imgList: { [key: string]: string }): Array<MessageButton> => {
  const buttons = [];
  const skinNames = Object.keys(imgList);
  for (let i = 0; i < skinNames.length; i += 1) {
    buttons.push(
      new MessageButton().setCustomId(`${i}`).setLabel(skinNames[i]).setStyle('SECONDARY')
    );
  }
  return buttons;
};
