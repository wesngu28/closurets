import mongoose from 'mongoose';

interface Welcome {
  _id: string;
  channelID: string;
  image?: string;
}

const required = {
  type: String,
  required: true
}

const WelcomeSchema = new mongoose.Schema({
  _id: required,
  channelID: required,
  image: required
})

export default mongoose.model<Welcome>('Welcome', WelcomeSchema);