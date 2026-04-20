import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import pkg from "multer-storage-cloudinary";
// Handle both named export and default export cases for ESM compatibility
const CloudinaryStorage = pkg.CloudinaryStorage || pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Configuration (Only if credentials provided)
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isImage = file.mimetype.startsWith('image/');
      return {
        folder: "skillswap",
        resource_type: isImage ? 'image' : 'raw',
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        allowed_formats: ["jpg", "png", "jpeg", "pdf", "zip"],
      };
    },
  });
} else {
  // Local Disk Storage fallback (for development without internet)
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|zip|rar|7z/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error("Allowed files: Images, PDF, Word, PPT, and Zip/Archives (max 20MB)"));
    }
  },
});

export default upload;
