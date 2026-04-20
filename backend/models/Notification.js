import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" }, // Optional for system broadcasts
    type: { 
      type: String, 
      enum: ["message", "request", "rating", "system", "accepted", "rejected", "follow", "endorsement"], 
      required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Optional link to a specific page
    data: { type: Schema.Types.Mixed }, // Arbitrary data like request ID
  },
  { timestamps: true },
);

export default mongoose.model("Notification", NotificationSchema);
