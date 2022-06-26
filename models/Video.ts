import mongoose from 'mongoose';

export interface Video {
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


export const VideoSchema = new mongoose.Schema<Video>({
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