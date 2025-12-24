import multer from "multer";
import fs from "fs";
import path from "path";

// Dynamic folder creation based on route
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/general"; // fallback

    if (req.baseUrl.includes("categories")) folder = "uploads/categories";
    else if (req.baseUrl.includes("subcategories")) folder = "uploads/subcategories";
    else if (req.baseUrl.includes("services")) folder = "uploads/services";

    const uploadPath = path.join(process.cwd(), folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

// Optional: validate file type (only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// ✅ Named export
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});