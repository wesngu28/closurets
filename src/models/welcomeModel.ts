import mongoose from 'mongoose';
import { Welcome } from '../types/Welcome';

const required = {
  type: String,
  required: true,
};

const WelcomeSchema = new mongoose.Schema({
  _id: required,
  channelID: required,
  image: required,
});

export default mongoose.model<Welcome>('Welcome', WelcomeSchema);
