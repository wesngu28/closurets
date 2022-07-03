import mongoose from 'mongoose';
import { Channel } from '../types/Channel';

const ChannelSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    english_name: String,
  },
  { collation: { locale: 'en', strength: 2 } }
);

export default mongoose.model<Channel>('Channel', ChannelSchema);
