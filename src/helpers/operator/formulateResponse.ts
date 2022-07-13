import { MessageEmbed } from 'discord.js';
import { Operator } from '../../types/Operator';

export const formulateResponse = (operator: Operator) => {
  const { name, rarity, url, voicelines, biography, lore, artist, va, quote, art } = operator;
  const [, class1, class2] = operator.class;
  const opClass = class2 || class1;
  const author = {
    name: `${'★'.repeat(Number(rarity))} ${opClass}`,
  };

  const operatorEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(name)
    .setURL(url)
    .setDescription(voicelines['Appointed as Assistant'])
    .setAuthor(author)
    .addField('Biography', biography)
    .addFields(
      {
        name: 'Race',
        value: lore.Race,
        inline: true,
      },
      {
        name: 'Birth',
        value: lore['Place of Birth'],
        inline: true,
      },
      {
        name: 'Birthday',
        value: lore.Birthday,
        inline: true,
      },
      {
        name: 'Height',
        value: lore.Height,
        inline: true,
      },
      {
        name: 'Artist',
        value: artist,
        inline: true,
      },
      {
        name: 'JP VA',
        value: va,
        inline: true,
      }
    )
    .addField('Quote', quote)
    .setImage(art.none)
    .setTimestamp();
  return operatorEmbed;
};
