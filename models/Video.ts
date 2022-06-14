import mongoose from 'mongoose';

interface Video {
  title: String;
  link: String;
  pubDate: String;
  author: String;
  id: String;
  isoDate: String;
  type: String;
  authorID: String;
  announced?: Boolean;
}


const VideoSchema = new mongoose.Schema<Video>({
  title: String,
  link: String,
  pubDate: String,
  author: String,
  id: String,
  isoDate: String,
  type: String,
  authorID: String,
  announced: Boolean
})

export default mongoose.model<Video>('Video', VideoSchema);