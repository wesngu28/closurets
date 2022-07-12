import mongoose from 'mongoose';
import { Tracker } from '../types/Tracker';

const required = {
  type: String,
  required: true,
};

const TrackSchema = new mongoose.Schema({
  _id: required,
  channelID: required,
  ytID: required,
  uploadsPlaylist: required,
});

export default mongoose.model<Tracker>('Tracker', TrackSchema);
