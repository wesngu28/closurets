import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";
import fetch from 'node-fetch';

export const E2 = {
	data: new SlashCommandBuilder()
	.setName('e2')
	.setDescription('Replies with your input!')
	.addStringOption(option => option.setName('name').setDescription('Rhodes Island Operator').setRequired(true)),
	async execute(interaction: Interaction) {
		try {
      if(interaction.isCommand()) {
        let name = interaction.options.getString('name');
			  name = name!.replace(" ", "-");
        let response = await fetch(
          `https://rhodesapi.herokuapp.com/api/rhodes/skins/e2/${name}`
        );
        let e2 = await response.json();
        await interaction.reply(e2.e2);
      }
		} catch (error) {
      if(interaction.isCommand()) {
			  console.error(error);
			  await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
		}
	},
}