
import { CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

export interface Command {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>; // eslint-disable-line no-unused-vars
}
