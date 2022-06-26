import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, MessageButton, MessageActionRow, Interaction, ButtonInteraction, Message } from "discord.js";
import fetch from 'node-fetch';
import { Operator } from "../types/Operator";

export const operator = {
	data: new SlashCommandBuilder()
		.setName('operator')
		.setDescription('Replies with your input!')
		.addStringOption(option => option.setName('name').setDescription('Rhodes Island Operator').setRequired(true)),
    async execute(interaction: Interaction) {
      try {
        if(interaction.isCommand()) {
          let name = interaction.options.getString('name');
          name = name!.replaceAll(' ', '-');
          const data = await getOperatorData(name);
          const imgList: {[key: string]: string} = data['art'];
          let buttons = assembleButtons(imgList);
          const embed = formulate_response(data);
          const timeout = 120000;
          await skinPaginator(interaction, embed, buttons, imgList, timeout)
        }
      } catch (error) {
        if(interaction.isCommand()) {
          await interaction.reply({ content: 'There was an error while executing this command!' + error, ephemeral: true });
        }
      }
    }
}

const getOperatorData = async(operator: string) => {
  operator = operator.replace(' ', '-');
  const response = await fetch(`https://rhodesapi.herokuapp.com/api/rhodes/operator/${operator}`);
  const json: Operator = await response.json();
  return json;
}

function assembleButtons(imgList: {[key: string]: string}){
  const buttons = [];
  const skinNames = Object.keys(imgList);
  for (let i = 0; i < skinNames.length; i++){
    buttons.push(new MessageButton()
      .setCustomId('' + i)
      .setLabel(skinNames[i])
      .setStyle('SECONDARY'));
  }
  return buttons;
}

function formulate_response(operator: Operator) {
  let rarity = '';
  for(let i = 0; i < Number(operator.rarity); i++) {
    rarity = rarity + '★';
  }
  let author = {
    name: rarity
  }

  const operatorEmbed = new MessageEmbed()
    .setColor('#0099ff')
      .setTitle(operator.name)
      .setURL(operator.url)
      .setDescription(operator.voicelines['Appointed as Assistant'])
      .setAuthor(author)
      .addField('Biography', operator.biography)
      .addFields({
        name: 'Origin',
        value: `${operator.lore.Gender} ${operator.lore.Race} from ${operator.lore['Place of Birth']}`
      }, {
        name: 'Birthday',
        value: operator['lore']['Birthday'],
        inline: true
      }, {
        name: 'Height',
        value: operator['lore']['Height'],
        inline: true
      }, {
        name: '\u200B', value: '\u200B',
      }, {
        name: 'Artist',
        value: operator.artist,
        inline: true
      }, {
        name: 'JP VA',
        value: operator.va,
        inline: true
      })
      .addField('Quote', operator.quote)
      .setImage(operator.art.Base)
      .setTimestamp()
    ;
  return operatorEmbed;
}

async function skinPaginator(interact: Interaction, embed: MessageEmbed, buttons: MessageButton[], imgList: {[key: string]: string}, timeout = 120000) {
  const row = new MessageActionRow().addComponents(buttons);
  if(interact.isCommand()) {
    await interact.deferReply();
    let int = await interact.editReply(({
      embeds: [embed],
      components: [row],
    })) as Message<boolean>;
    const filter = (i: Interaction) => i.user.id === interact.user.id;
    const collector = int.createMessageComponentCollector({
      filter,
      time: timeout,
    });
    collector.on("collect", async (button: ButtonInteraction) => {
      await button.deferUpdate();
      await button.editReply({
        embeds: [embed.setImage(imgList[Object.keys(imgList)[Number(button.customId)]])],
        components: [row],
      });
      collector.resetTimer();
    });
    return int;
  }
}