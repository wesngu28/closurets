import mongoose from 'mongoose';

export interface Video {
  title: string;
  link: string;
  pubDate?: string;
  author?: string;
  id?: string;
  isoDate?: string;
  type?: string;
  authorID?: string;
}


export const VideoSchema = new mongoose.Schema<Video>({
  title: String,
  link: String,
  pubDate: String,
  author: String,
  id: String,
  isoDate: String,
  type: String,
  authorID: String
})