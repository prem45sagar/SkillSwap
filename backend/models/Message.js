import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    messageType: {
      type: String,
      enum: ["text", "image", "document", "system", "video_call"],
      default: "text",
    },
    fileUrl: { type: String },
    fileName: { type: String },
    isRead: { type: Boolean, default: false },
    swapRequest: { type: Schema.Types.ObjectId, ref: "SwapRequest" },
  },
  { timestamps: true },
);

export default mongoose.model("Message", MessageSchema);
