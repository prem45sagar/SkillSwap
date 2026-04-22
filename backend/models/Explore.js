import mongoose, { Schema } from "mongoose";

const ExploreSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    languages: [{ type: String }],
    duration: { type: Number, default: 7 },
    durationUnit: { type: String, enum: ["days", "minutes"], default: "days" },
    startDate: { type: Date },
    endDate: { type: Date },
    desiredSkill: { type: String },
    criteria: { type: String },
    status: { 
      type: String, 
      enum: ["open", "ongoing", "occupied", "completed"], 
      default: "open" 
    },
    endorsements: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, collection: "explore" },
);

export default mongoose.model("Explore", ExploreSchema, "explore");
