import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: Schema.Types.ObjectId, ref: "Explore", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    swapRequest: { type: Schema.Types.ObjectId, ref: "SwapRequest" }
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
