import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/general";

    if (req.baseUrl.includes("categories")) folder = "uploads/categories";
    else if (req.baseUrl.includes("subcategories")) folder = "uploads/subcategories";
    else if (req.baseUrl.includes("services")) folder = "uploads/services";
    else if (req.baseUrl.includes("service-providers")) folder = "uploads/providers";

    const uploadPath = path.join(process.cwd(), folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    const uniqueName = Date.now() + "-" + safeName;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    req.fileValidationError = "Only image or PDF files are allowed!";
    cb(null, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// ✅ Helper for provider uploads (multiple certificates, address proofs, id proofs)
export const providerUpload = upload.fields([
  { name: "certificate", maxCount: 10 },   // multiple certificates
  { name: "addressProof", maxCount: 10 },  // multiple address proofs
  { name: "idProof", maxCount: 10 }        // multiple ID proofs
]);