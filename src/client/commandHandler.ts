import fs from 'fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';
import { Closure } from './Closure';

dotenv.config({ path: path.resolve(__dirname, './.env') });

export async function commandHandler(client: Closure): Promise<void> {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
  for await (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    const commandName = Object.keys(command)[0];
    client.commands.set(command[commandName].data.name, command);
  }
}

export async function deployCommands(): Promise<void> {
  const commands = [];
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.ts'));

  for await (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    const commandName = Object.keys(command)[0];
    commands.push(command[commandName].data.toJSON());
  }

  const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!);

  rest
    .put(Routes.applicationCommands(process.env.CID!), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
}
