import { Interaction } from "discord.js";
import { Closure } from "../client/Closure";

export const interactionCreate = async (interaction: Interaction, client: Closure) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
  const commandName = Object.keys(command)[0];
	if (!command) return;

	try {
		await command[commandName].execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

}