import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";
import parse from "node-html-parser";
import dotenv from 'dotenv';
dotenv.config();
import fetch from "node-fetch";
import { makeAnnouncement, infoStringExamine, getIDFromLink } from "../functions/youtube";
import YoutubeChannel from "../models/Channel";

export const live = {
	data: new SlashCommandBuilder()
	.setName('live')
	.setDescription('Name for vtuber, must be in Holodex.')
	.addStringOption(option => option.setName('name').setDescription('Please provide either first/last or full name for a vtuber in holodex.').setRequired(true)),
  async execute (interaction: Interaction) {
    try {
      if(interaction.isCommand()) {
        let name = interaction.options.getString('name');
        name = name!.charAt(0).toUpperCase() + name!.slice(1);
        const searchRegex = new RegExp(name);
        let match = await YoutubeChannel.find({ "$or": [{ name: searchRegex }, { english_name: searchRegex }] }).limit(1);
        if(match[0]) {
          const responseLive = await fetch(`https://holodex.net/api/v2/live?channel_id=${match[0].id}`);
          const liveJson = await responseLive.json();
          const responseLivestream = await fetch(`https://holodex.net/api/v2/videos/${liveJson[0].id}`);
          const livestreamJson = await responseLivestream.json();
          let announcementEmbed = await makeAnnouncement(livestreamJson.id);
          await interaction.reply({
            content: announcementEmbed.content,
            embeds: announcementEmbed.embeds
          })
        } else {
          let otherChannelID = await getIDFromLink(name);
          console.log(otherChannelID);
          const response = await fetch(`https://youtube.com/channel/${otherChannelID}/live`);
          const text = await response.text();
          const html = parse(text);
          const canonicalURLTag = html.querySelector('link[rel=canonical]');
          let canonicalURL = canonicalURLTag!.getAttribute('href')!;
          if (canonicalURL.includes('/watch?v=')) {
            interaction.deferReply();
            const ytInfoString = await infoStringExamine(canonicalURL);
            if(ytInfoString!.includes('Started')) {
              let cutString = 'https://www.youtube.com/watch?v=';
              let queryIndex = canonicalURL.indexOf('https://www.youtube.com/watch?v=');
              canonicalURL = canonicalURL.replace(canonicalURL.substring(queryIndex, cutString.length), "");
              const announcementEmbed = await makeAnnouncement(canonicalURL);
              await interaction.editReply({
                content: announcementEmbed.content,
                embeds: announcementEmbed.embeds
              })
            } else {
              await interaction.reply({content: 'That channel is not currently streaming!', ephemeral: true});
            }
          } else {
            await interaction.reply({content: 'That channel is not currently streaming!', ephemeral: true});
          }
        }
      }
		} catch (error) {
			console.error(error);
			if(interaction.isCommand()) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
}