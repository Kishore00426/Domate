import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure uploads/services folder exists
const uploadPath = path.join(process.cwd(), "uploads/services");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

// ✅ Named export
export const upload = multer({ storage });