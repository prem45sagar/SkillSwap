import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["superadmin", "moderator", "admin"], 
      default: "admin" 
    },
    avatar: { type: String, default: "" },
    lastLogin: { type: Date, default: Date.now },
    permissions: [{ type: String }], // e.g., ["manage_users", "manage_swaps", "view_reports"]
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", AdminSchema);
