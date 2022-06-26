import mongoose from "mongoose";

const databaseConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI!, { keepAlive: true });
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default databaseConnect;