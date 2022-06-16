import { Closure } from './client/Closure'
import databaseConnect from './models/connect';
import { eventHandler } from './client/eventHandler';
import dotenv from 'dotenv';
dotenv.config();

databaseConnect();
const client = new Closure;

eventHandler(client);

client.login(process.env.TOKEN);