import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
  admin: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AdminLog", AdminLogSchema);
