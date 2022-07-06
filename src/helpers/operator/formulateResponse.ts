import { MessageEmbed } from 'discord.js';
import { Operator } from '../../types/Operator';

export const formulateResponse = (operator: Operator) => {
  const rarity = '★'.repeat(Number(operator.rarity));
  const [, class1, class2] = operator.class;
  const opClass = class2 || class1;
  const author = {
    name: `${rarity} ${opClass}`,
  };

  const operatorEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(operator.name)
    .setURL(operator.url)
    .setDescription(operator.voicelines['Appointed as Assistant'])
    .setAuthor(author)
    .addField('Biography', operator.biography)
    .addFields(
      {
        name: 'Race',
        value: operator.lore.Race,
        inline: true,
      },
      {
        name: 'Birth',
        value: operator.lore['Place of Birth'],
        inline: true,
      },
      {
        name: 'Birthday',
        value: operator.lore.Birthday,
        inline: true,
      },
      {
        name: 'Height',
        value: operator.lore.Height,
        inline: true,
      },
      {
        name: 'Artist',
        value: operator.artist,
        inline: true,
      },
      {
        name: 'JP VA',
        value: operator.va,
        inline: true,
      }
    )
    .addField('Quote', operator.quote)
    .setImage(operator.art.none)
    .setTimestamp();
  return operatorEmbed;
};
