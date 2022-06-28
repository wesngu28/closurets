import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, Interaction } from "discord.js";
import Welcome from "../models/Welcome";

export const configureWelcome = {
  data: new SlashCommandBuilder()
  .setName('welcome')
	.setDescription('Configure welcome channel and image.')
	.addStringOption(option => option.setName('image').setDescription('Image url for welcomes')),
	async execute(interaction: Interaction) {
    if(!interaction.isCommand()) {
      return;
    }
    interface Welcome {
      _id: string;
      channelID: string;
      image?: string;
    }
    const member = interaction.member as GuildMember;
    if(member!.permissions.has("ADMINISTRATOR") === false) {
      await interaction.reply({ content: 'You are not able to execute this command!', ephemeral: true });
      return;
    }
    const guilded = await Welcome.findOne(({ _id: interaction.guild!.id }));
    if (guilded) {
      if(interaction.options.get('image')) {
        guilded.image = interaction.options.getString('image')!;
      } else {
        guilded.image = 'https://i.pinimg.com/originals/14/a5/de/14a5de56f19b4635b43f35805e3aa0aa.jpg';
      }
      guilded.save();
      interaction.reply({content: `Welcome configured to ${interaction.guild!.id}. Image set to ${guilded.image}`, ephemeral: true})
    } else {
      const welcomeObject: Welcome = {
        _id: interaction.guild!.id,
        channelID: interaction.channel!.id
      }
      if(interaction.options.get('image')) {
        welcomeObject.image = interaction.options.getString('image')!;
      } else {
        welcomeObject.image = 'https://i.pinimg.com/originals/14/a5/de/14a5de56f19b4635b43f35805e3aa0aa.jpg';
      }
      await Welcome.create(welcomeObject);
      interaction.reply({content: `Welcome configured to ${interaction.guild!.id}. Image set to ${welcomeObject.image}`, ephemeral: true})
    }
	},
}