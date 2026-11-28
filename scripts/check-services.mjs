import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

const mongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
let problems = 0;
try {
  await mongo.db(process.env.MONGODB_DB).command({ ping: 1 });
  console.log("MongoDB connection verified.");
} catch {
  console.error("MongoDB connection failed. Check Atlas network access and database permissions.");
  problems++;
} finally {
  await mongo.close();
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
try {
  await cloudinary.api.ping();
  console.log("Cloudinary connection verified.");
} catch {
  console.error("Cloudinary connection failed. Check the account and upload access.");
  problems++;
}
process.exitCode = problems ? 1 : 0;
