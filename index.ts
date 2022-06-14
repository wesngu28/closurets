import { Closure } from './client/Closure'
import databaseConnect from './models/connect';

import dotenv from 'dotenv';
dotenv.config();

databaseConnect();
const client = new Closure;