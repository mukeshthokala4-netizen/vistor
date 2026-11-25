import path from "path";

/* Where park JSON files live. Override with QR_DATA_DIR if you
   prefer a mounted volume in production. */
export const DATA_DIR =
  process.env.QR_DATA_DIR || path.join(process.cwd(), "data", "qr-code");

export const PARKS_DIR = path.join(DATA_DIR, "parks");

export const IMAGE_UPLOAD_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "images")
  : null;
