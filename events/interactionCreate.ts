import { Interaction } from "discord.js";
import { Closure } from "../client/Closure";
const commandCooldown = new Set();

export const interactionCreate = async (client: Closure, interaction: Interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
  const commandName = Object.keys(command)[0];
	if (!command) return;
  if (commandCooldown.has(`${interaction.commandName}.${interaction.user.id}`)) {
    interaction.reply({ content: 'Please wait for ten seconds after using this command before trying again', ephemeral: true });
    return;
  }

	try {
		await command[commandName].execute(interaction);
		commandCooldown.add(`${interaction.commandName}.${interaction.user.id}`);
		setTimeout(() => {
			commandCooldown.delete(`${interaction.commandName}.${interaction.user.id}`);
		}, 10000);
	} catch (error) {
		commandCooldown.delete(`${interaction.commandName}.${interaction.user.id}`);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

}