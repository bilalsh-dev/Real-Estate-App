import multer from "multer";
import {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTOS_PER_PROPERTY,
  PHOTO_EXTENSIONS,
} from "../config/constants.ts";
import { ValidationError } from "../lib/errors.ts";

export const PHOTOS_FIELD = "photos";

export const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: MAX_PHOTOS_PER_PROPERTY, fileSize: MAX_PHOTO_SIZE_BYTES },
  fileFilter: (_req, file, accept) => {
    if (file.mimetype in PHOTO_EXTENSIONS) {
      accept(null, true);
      return;
    }
    accept(
      new ValidationError([{ path: PHOTOS_FIELD, message: "Photos must be JPEG, PNG or WebP" }]),
    );
  },
}).array(PHOTOS_FIELD, MAX_PHOTOS_PER_PROPERTY);
