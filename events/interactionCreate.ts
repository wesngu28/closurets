import { Interaction } from "discord.js";
import { Closure } from "../client/Closure";

export const onInteraction = async (client: Closure, interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  await command.execute(interaction, interaction.client);

}