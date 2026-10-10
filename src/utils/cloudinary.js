import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, firebaseEnabled } from "../firebase";

const STORAGE_KEY_CLOUD_NAME = "mocosn_cloudinary_cloud_name";
const STORAGE_KEY_UPLOAD_PRESET = "mocosn_cloudinary_upload_preset";
const STORAGE_KEY_FOLDER = "mocosn_cloudinary_folder";

/**
 * Get the current Cloudinary configuration from localStorage or Vite environment variables.
 */
export function getCloudinaryConfig() {
  const envCloudName = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || "";
  const envUploadPreset = import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET || "";

  let localCloudName = "";
  let localUploadPreset = "";
  let localFolder = "nba_vlsi";

  try {
    localCloudName = localStorage.getItem(STORAGE_KEY_CLOUD_NAME) || "";
    localUploadPreset = localStorage.getItem(STORAGE_KEY_UPLOAD_PRESET) || "";
    localFolder = localStorage.getItem(STORAGE_KEY_FOLDER) || "nba_vlsi";
  } catch (err) {
    console.warn("Could not read Cloudinary configuration from localStorage:", err);
  }

  const cloudName = (localCloudName || envCloudName || "").trim();
  const uploadPreset = (localUploadPreset || envUploadPreset || "").trim();
  const folder = (localFolder || "nba_vlsi").trim();

  return {
    cloudName,
    uploadPreset,
    folder,
    isConfigured: Boolean(cloudName && uploadPreset),
    source: localCloudName ? "localStorage" : envCloudName ? "env" : "none"
  };
}

/**
 * Save custom Cloudinary settings to localStorage.
 */
export function saveCloudinaryConfig({ cloudName, uploadPreset, folder = "nba_vlsi" }) {
  try {
    if (cloudName !== undefined) {
      if (cloudName) {
        localStorage.setItem(STORAGE_KEY_CLOUD_NAME, cloudName.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_CLOUD_NAME);
      }
    }

    if (uploadPreset !== undefined) {
      if (uploadPreset) {
        localStorage.setItem(STORAGE_KEY_UPLOAD_PRESET, uploadPreset.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_UPLOAD_PRESET);
      }
    }

    if (folder !== undefined) {
      localStorage.setItem(STORAGE_KEY_FOLDER, (folder || "nba_vlsi").trim());
    }

    // Dispatch event so active components re-sync immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cloudinary-config-updated", {
        detail: { cloudName, uploadPreset, folder }
      }));
    }
  } catch (err) {
    console.warn("Could not save Cloudinary configuration:", err);
  }

  return getCloudinaryConfig();
}

/**
 * Upload an image file directly to Cloudinary via unsigned upload.
 * 
 * @param {File|Blob} file The image file to upload
 * @param {Object} options
 * @param {string} options.folder Cloudinary target folder
 * @param {string} [options.cloudName] Override cloud name
 * @param {string} [options.uploadPreset] Override upload preset
 * @returns {Promise<{ url: string, publicId: string, provider: 'cloudinary', width: number, height: number, format: string, bytes: number }>}
 */
export async function uploadToCloudinary(file, options = {}) {
  const config = getCloudinaryConfig();
  const cloudName = options.cloudName || config.cloudName;
  const uploadPreset = options.uploadPreset || config.uploadPreset;
  const folder = options.folder || config.folder || "nba_vlsi";

  if (!cloudName) {
    throw new Error("Cloudinary Cloud Name is not configured. Please set your Cloud Name in Cloud Settings.");
  }

  if (!uploadPreset) {
    throw new Error("Cloudinary Upload Preset is not configured. Please create an unsigned upload preset and configure it in Cloud Settings.");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Cloudinary upload failed with HTTP status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
    createdAt: data.created_at,
    provider: "cloudinary"
  };
}

/**
 * Upload an image file to Firebase Storage as secondary cloud storage.
 * 
 * @param {File|Blob} file 
 * @param {string} pathPrefix 
 * @returns {Promise<{ url: string, provider: 'firebase', path: string }>}
 */
export async function uploadToFirebaseStorage(file, pathPrefix = "uploads") {
  if (!firebaseEnabled || !storage) {
    throw new Error("Firebase Storage is not enabled or initialized.");
  }

  const sanitizedFileName = (file.name || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
  const fullPath = `${pathPrefix}/${Date.now()}_${sanitizedFileName}`;
  const storageRef = ref(storage, fullPath);

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  return {
    url: downloadUrl,
    provider: "firebase",
    path: fullPath
  };
}

/**
 * Unified Cloud Image Uploader.
 * Tries Cloudinary first if configured.
 * If Cloudinary fails or is unconfigured, falls back to Firebase Storage if available.
 * 
 * @param {File|Blob} file
 * @param {Object} options
 * @returns {Promise<{ url: string, provider: 'cloudinary'|'firebase', publicId?: string }>}
 */
export async function uploadImageToCloud(file, options = {}) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Basic validation
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("The selected file is not a supported image format.");
  }

  const config = getCloudinaryConfig();

  // 1. If Cloudinary is configured, try Cloudinary
  if (config.isConfigured || options.cloudName) {
    try {
      return await uploadToCloudinary(file, options);
    } catch (cloudErr) {
      console.warn("Cloudinary upload attempt failed:", cloudErr.message);

      // Attempt fallback to Firebase Storage if available
      if (firebaseEnabled && storage) {
        console.info("Falling back to Firebase Storage for cloud upload...");
        try {
          return await uploadToFirebaseStorage(file, options.folder || "cloud_images");
        } catch (fbErr) {
          console.warn("Firebase Storage fallback also failed:", fbErr.message);
        }
      }

      // Re-throw original Cloudinary error if both fail
      throw cloudErr;
    }
  }

  // 2. If Cloudinary is not configured yet, try Firebase Storage
  if (firebaseEnabled && storage) {
    try {
      return await uploadToFirebaseStorage(file, options.folder || "cloud_images");
    } catch (fbErr) {
      console.warn("Firebase Storage upload failed:", fbErr.message);
    }
  }

  // 3. If neither is ready
  throw new Error(
    "Cloud storage is not configured. Please configure your Cloudinary Cloud Name and unsigned Upload Preset in Cloud Settings."
  );
}

/**
 * Test a Cloudinary configuration with a lightweight 1x1 GIF test upload.
 */
export async function testCloudinaryConnection(cloudName, uploadPreset) {
  if (!cloudName || !uploadPreset) {
    return { ok: false, error: "Both Cloud Name and Upload Preset are required." };
  }

  try {
    // 1x1 transparent gif base64
    const test1x1Gif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const res = await uploadToCloudinary(test1x1Gif, {
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim(),
      folder: "nba_vlsi/test_connection"
    });

    return { ok: true, url: res.url, publicId: res.publicId };
  } catch (err) {
    return { ok: false, error: err.message || "Failed to reach Cloudinary." };
  }
}
