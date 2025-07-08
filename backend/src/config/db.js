import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URL;
export async function connectDB() {
  try {
    const conn = await mongoose.connect(`${MONGODB_URL}/smart-news`);
    console.log("MongoDB Connected");
    console.log("Connection host: ", conn.connection.host);
  } catch (error) {
    console.log("MongoDB Connection error", error);
    process.exit(1);
  }
}
