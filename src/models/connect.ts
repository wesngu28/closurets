import mongoose from 'mongoose';

export const databaseConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI!, { keepAlive: true });
    if (process.env.NODE_ENV === 'development')
      console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.log(error);
    process.exit(1);
  }
};
