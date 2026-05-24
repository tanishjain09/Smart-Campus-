const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const ApiError = require("../utils/apiError");

/**
 * Multer storage engine that uploads issue images directly to Cloudinary.
 */
const storage = cloudinaryStorage({
  cloudinary,
  folder: process.env.CLOUDINARY_ISSUE_FOLDER || "campus-issues",
  allowedFormats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ quality: "auto", fetch_format: "auto" }]
});

/**
 * Restricts uploads to image mime types.
 *
 * @param {import("express").Request} req Express request.
 * @param {Express.Multer.File} file Uploaded file metadata.
 * @param {Function} cb Multer callback.
 * @returns {void}
 */
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    cb(new ApiError(400, "Only image uploads are allowed"));
    return;
  }

  cb(null, true);
}

/**
 * Shared multer middleware for issue image uploads.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
