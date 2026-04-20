import mongoose from "mongoose";

const PlatformSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  platformName: { type: String, default: "SkillSwap" },
  allowNewRegistrations: { type: Boolean, default: true },
  systemNotice: { type: String, default: "" },
});

export default mongoose.model("PlatformSettings", PlatformSettingsSchema);
