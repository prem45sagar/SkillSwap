import mongoose, { Schema } from "mongoose";

const SwapRequestSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderSkill: { type: Schema.Types.ObjectId, ref: "Explore", required: true },
    receiverSkill: {
      type: Schema.Types.ObjectId,
      ref: "Explore",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    message: { type: String },
    senderReviewed: { type: Boolean, default: false },
    receiverReviewed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("SwapRequest", SwapRequestSchema);
