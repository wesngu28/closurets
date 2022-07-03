import mongoose from 'mongoose';
import { Video } from '../types/Video';

export const VideoSchema = new mongoose.Schema<Video>({
  title: String,
  link: String,
  pubDate: String,
  author: String,
  id: String,
  isoDate: String,
  type: String,
  authorID: String,
});
