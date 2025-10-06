import mongoose from "mongoose";

const db = mongoose.connect(process.env["MONGO_URI"] as string).then(() => console.log("Connected to Database"));
export default db;
