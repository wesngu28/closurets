import { GuildMember, Message, SlashCommandBuilder } from 'discord.js';
import { deleteAndFollowUp } from '../helpers/deleteAndFollowUp';
import { EmbedBuilder } from '@discordjs/builders';
import { Command } from 'types/Command';

export const poll: Command = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll.')
    .addStringOption(option =>
      option.setName('text').setDescription('Insert poll question or text here').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('options')
        .setDescription('Separate each option with a | character, no spaces')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      if (!interaction.isCommand()) return;
      const member = interaction.member as GuildMember;
      if (member!.roles.cache.has('ADMINISTRATOR') === false) {
        await interaction.reply({
          content: 'You are not able to execute this command!',
          ephemeral: true,
        });
        return;
      }
      const pollEmbed = new EmbedBuilder().setTitle(`📊 ${interaction.options.get('text')?.value?.toString()!}`);
      const strings: string[] = interaction.options.get('options')?.value?.toString().split('|')!;
      const alphabet = [
        '🇦',
        '🇧',
        '🇨',
        '🇩',
        '🇪',
        '🇫',
        '🇬',
        '🇭',
        '🇮',
        '🇯',
        '🇰',
        '🇱',
        '🇲',
        '🇳',
        '🇴',
        '🇵',
        '🇶',
        '🇷',
        '🇸',
        '🇹',
        '🇺',
        '🇻',
        '🇼',
        '🇽',
        '🇾',
        '🇿',
      ];
      if (strings.length > alphabet.length)
        interaction.reply({ content: 'You have specified too many options', ephemeral: true });
      const argumentFormatter = [];
      let alphabetChar = 0;
      for (const option of strings) {
        argumentFormatter.push(`${alphabet[alphabetChar]} : ${option}`);
        alphabetChar += 1;
      }
      pollEmbed.setDescription(argumentFormatter.join('\n\n'));
      await interaction.reply({ embeds: [pollEmbed] });
      const reactor = await interaction.fetchReply();
      for (let i = 0; i < strings.length; i += 1) {
        (reactor as Message<boolean>).react(alphabet[i]);
        alphabetChar += 1;
      }
    } catch (err) {
      if (!interaction.isCommand()) return;
      deleteAndFollowUp(interaction, 'There was an error while executing this command!');
    }
  },
};
