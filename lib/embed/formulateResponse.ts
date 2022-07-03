import { MessageEmbed } from 'discord.js';
import { Operator } from '../../src/types/Operator';

export const formulateResponse = (operator: Operator) => {
  let rarity = '';
  for (let i = 0; i < Number(operator.rarity); i += 1) {
    rarity += '★';
  }
  let opclass: string;
  const [, class1, class2] = operator.class;
  if (class2) {
    opclass = class2;
  } else {
    opclass = class1;
  }
  const author = {
    name: `${rarity} ${opclass}`,
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
