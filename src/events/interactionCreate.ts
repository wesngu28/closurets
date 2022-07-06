import { Interaction } from 'discord.js';
import { Closure } from '../client/Closure';
import { DiscordEvent } from '../types/DiscordEvent';

export const interactionCreate: DiscordEvent = {
  name: 'interactionCreate',
  async execute(client: Closure, interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    const commandName = Object.keys(command)[0];
    if (!command) return;
    if (
      client.cooldown.has(`${interaction.guild}.${interaction.commandName}.${interaction.user.id}`)
    ) {
      interaction.reply({
        content: 'Please wait for ten seconds after using this command before trying again',
        ephemeral: true,
      });
      return;
    }

    try {
      await command[commandName].execute(interaction);
      client.cooldown.add(`${interaction.guild}.${interaction.commandName}.${interaction.user.id}`);
      setTimeout(() => {
        client.cooldown.delete(
          `${interaction.guild}.${interaction.commandName}.${interaction.user.id}`
        );
      }, 10000);
    } catch (error) {
      client.cooldown.delete(
        `${interaction.guild}.${interaction.commandName}.${interaction.user.id}`
      );
    }
  },
};
