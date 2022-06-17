import { CommandInteraction } from "discord.js";
import { Commands } from '../commands/List';

export const onInteraction = async (interaction: CommandInteraction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const slashCmd = Commands.find(c => c.data.name === interaction.commandName);
  if(!slashCmd) {
    interaction.reply( { content: 'Not a valid command',  ephemeral: true } );
    return;
  }
  await slashCmd.run(interaction);
}