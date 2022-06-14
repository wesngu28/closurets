import mongoose from 'mongoose';

interface Channel {
  id: String;
  name: String;
  english_name: String;
}

const ChannelSchema = new mongoose.Schema({
  id: String,
  name: String,
  english_name: String
})

export default mongoose.model<Channel>('Channel', ChannelSchema);