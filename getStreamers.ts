import fetch from 'node-fetch';
import Channel from './models/Channel';
import databaseConnect from './models/connect';
import dotenv from 'dotenv';
dotenv.config();

databaseConnect();
getStreamers();
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getStreamers() {
  for(let i = 0; i <= 1300; i++) {
    await sleep(2500);
    let response = await fetch(
      `https://holodex.net/api/v2/channels?type=vtuber&offset=${i}&limit=1`, {
        method: 'GET',
        headers: {
          'x-api-key': 'b72e01f7-0b1e-4bf3-862d-04687142608f'
        },
      });
    let json = await response.json();
    console.log('Added ' + json[0].english_name);
    await Channel.create(json)
  };
}