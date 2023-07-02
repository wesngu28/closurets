import dotenv from 'dotenv';
import ChannelModel from './src/models/channelModel';
import { databaseConnect } from './src/models/connect';
import { Channel } from './src/types/Channel';

dotenv.config();

databaseConnect();
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getStreamers() {
  const valid = true;
  let offset = 0;
  while (valid) {
    await sleep(2500);
    const holoRes = await fetch(
      `https://holodex.net/api/v2/channels?type=vtuber&offset=${offset++}&limit=1`,
      {
        method: 'GET',
        headers: {
          'x-api-key': process.env.HOLODEX_API!,
        },
      }
    );
    const json: Array<Channel> = (await holoRes.json()) as Array<Channel>;
    if (json[0]) {
      const findAlreadyExisting = await ChannelModel.findOne({
        name: json[0].name,
      });
      if (!findAlreadyExisting) {
        console.log(`Added ${json[0].english_name}`);
        await ChannelModel.create(json);
      }
      console.log(`Database already has ${json[0].english_name}`);
    }
  }
}

getStreamers();
