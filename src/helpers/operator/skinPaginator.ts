import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  Interaction,
  Message,
} from 'discord.js';
import { Art } from 'types/Operator';

export const skinPaginator = async (
  interact: Interaction,
  embed: EmbedBuilder,
  buttons: ButtonBuilder[],
  imgList: Array<Art>,
  timeout = 120000
): Promise<Message<boolean> | undefined> => {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
  if (interact.isCommand()) {
    const buttonHolder = (await interact.editReply({
      embeds: [embed],
      components: [row],
    })) as Message<boolean>;
    const filter = (i: Interaction) => i.user.id === interact.user.id;
    const collector = buttonHolder.createMessageComponentCollector({
      filter,
      time: timeout,
    });
    collector.on('collect', async (button: ButtonInteraction) => {
      await button.deferUpdate();
      await button.editReply({
        embeds: [embed.setImage(imgList[Number(button.customId)].link)],
        components: [row],
      });
      collector.resetTimer();
    });
    return buttonHolder;
  }
};
