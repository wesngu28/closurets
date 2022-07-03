import fs from 'fs';
import path from 'node:path';
import { Closure } from './Closure';

export async function eventHandler(client: Closure): Promise<void> {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
  for await (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(filePath);
    const name = Object.keys(event)[0];
    if (event[name].execute) {
      const func: Function = event[name].execute as Function;
      if (name === 'interactionCreate') {
        client.on(name, async (interaction: any) => func(client, interaction));
      } else {
        client.on(event[name].name, async (...args) => func(...args));
      }
    }
  }
}
