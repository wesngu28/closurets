import { EmbedBuilder } from 'discord.js';
import { Operator } from '../../types/Operator';

export const formulateResponse = (operator: Operator) => {
  const {
    name,
    rarity,
    url,
    class: [, class1, class2],
    voicelines,
    biography,
    lore,
    artist,
    va,
    quote,
    art,
  } = operator;
  const author = {
    name: `${'★'.repeat(Number(rarity))} ${class2 || class1}`,
  };

  const operatorEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(name)
    .setURL(url)
    .setDescription(voicelines.appointed_as_assistant)
    .setAuthor(author)
    .addFields(
      {
        name: 'Biography',
        value: biography
      },
      {
        name: 'Race',
        value: lore.race,
        inline: true,
      },
      {
        name: 'Birth',
        value: lore.place_of_birth,
        inline: true,
      },
      {
        name: 'Birthday',
        value: lore.birthday,
        inline: true,
      },
      {
        name: 'Height',
        value: lore.height,
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
      },
      {
        name: 'Quote',
        value: quote
      }
    )
    .setImage(art[0].link)
    .setTimestamp();
  return operatorEmbed;
};
