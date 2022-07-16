export interface HolodexVideo {
  id: string;
  title: string;
  type: string;
  topic_id: string;
  published_at: string;
  available_at: string;
  duration: number;
  status: string;
  start_scheduled: string;
  start_actual: string;
  live_viewers: number;
  description: number;
  channel: {
    id: string;
    name: string;
    org: string;
    type: string;
    photo: string;
    english_name: string;
    view_count: string;
    video_count: string;
    subscriber_count: string;
    clip_count: number;
  };
}
