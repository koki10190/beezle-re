import mongoose from "mongoose";

const schema = new mongoose.Schema({
    author: { type: String, required: true },
    content: { type: String, required: true },
    channel: { type: String, required: true },
    msg_id: { type: String, required: true },
    timestamp: { type: Date, required: true },
});

export default mongoose.model("DmMessage", schema);
