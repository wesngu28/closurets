import mongoose from 'mongoose';

interface Tracker {
  _id: string;
  channelID: string;
  ytID?: string;
}

const required = {
  type: String,
  required: true
}

const TrackSchema = new mongoose.Schema({
  _id: required,
  channelID: required,
  ytID: required
})

export default mongoose.model<Tracker>('Tracker', TrackSchema);