import { Closure } from "./Closure";
import fs from 'fs';
import path from 'node:path';

export async function eventHandler (client: Closure) : Promise<void> {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    const name = Object.keys(event)[0];
    const func: Function = Object.values(event)[0] as Function;
    if (event.once) {
      client.once(name, async(...args) => await func(...args));
    } else {
      client.on(name, async(...args) => await func(...args));
    }
  }
}