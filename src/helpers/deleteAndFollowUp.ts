import { CommandInteraction } from 'discord.js';

export async function deleteAndFollowUp(interaction: CommandInteraction, contentBody: string) {
  await interaction.deleteReply();
  await interaction.followUp({
    content: contentBody,
    ephemeral: true,
  });
}
