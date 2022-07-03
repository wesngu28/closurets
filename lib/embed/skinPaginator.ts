import {
  ButtonInteraction,
  Interaction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';

export const skinPaginator = async (
  interact: Interaction,
  embed: MessageEmbed,
  buttons: MessageButton[],
  imgList: { [key: string]: string },
  timeout = 120000
): Promise<Message<boolean> | undefined> => {
  const row = new MessageActionRow().addComponents(buttons);
  if (interact.isCommand()) {
    await interact.deferReply();
    const int = (await interact.editReply({
      embeds: [embed],
      components: [row],
    })) as Message<boolean>;
    const filter = (i: Interaction) => i.user.id === interact.user.id;
    const collector = int.createMessageComponentCollector({
      filter,
      time: timeout,
    });
    collector.on('collect', async (button: ButtonInteraction) => {
      await button.deferUpdate();
      await button.editReply({
        embeds: [embed.setImage(imgList[Object.keys(imgList)[Number(button.customId)]])],
        components: [row],
      });
      collector.resetTimer();
    });
    return int;
  }
  return undefined;
};
