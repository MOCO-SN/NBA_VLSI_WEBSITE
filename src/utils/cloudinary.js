import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, firebaseEnabled } from "../firebase";
import {
  uploadImageViaProxy,
  fetchCloudinaryConfigFromProxy
} from "./proxyClient";

/**
 * Helper to convert File/Blob to base64 Data URL for server proxy upload
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (typeof file === "string") return resolve(file);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file directly to Cloudinary via unsigned upload (secondary fallback).
 */
export async function uploadToCloudinary(file, options = {}) {
  // Retrieve config dynamically in-memory from proxy endpoint
  const config = await fetchCloudinaryConfigFromProxy();
  const cloudName = options.cloudName || config?.cloudName;
  const uploadPreset = options.uploadPreset || config?.uploadPreset;
  const folder = options.folder || "nba_vlsi";

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration not provided by proxy gateway.");
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
 * Upload an image file to Firebase Storage as cloud storage fallback.
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
 * 1. Primary: Uploads securely via the PHP proxy endpoint (server-side signed upload).
 * 2. Secondary: Tries Cloudinary direct if proxy is unavailable.
 * 3. Tertiary: Falls back to Firebase Storage.
 * 4. Safe preview: If network fails, provides local preview without crashing.
 * 
 * NOTE: NEVER stores API keys in localStorage.
 */
export async function uploadImageToCloud(file, options = {}) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("The selected file is not a supported image format.");
  }

  // 1. Primary: Server-side proxy upload (credentials stay secure on server)
  try {
    const base64Data = typeof file === "string" ? file : await fileToBase64(file);
    const proxyRes = await uploadImageViaProxy(base64Data);
    if (proxyRes && proxyRes.url) {
      return proxyRes;
    }
  } catch (proxyErr) {
    console.warn("Proxy upload attempt:", proxyErr?.message || proxyErr);
  }

  // 2. Secondary: Direct Cloudinary
  try {
    return await uploadToCloudinary(file, options);
  } catch (cloudErr) {
    console.warn("Direct cloud upload attempt:", cloudErr?.message || cloudErr);

    // 3. Tertiary: Firebase Storage
    if (firebaseEnabled && storage) {
      try {
        return await uploadToFirebaseStorage(file, options.folder || "cloud_images");
      } catch (fbErr) {
        console.warn("Firebase Storage fallback failed:", fbErr.message);
      }
    }

    // 4. Fallback local preview
    try {
      const dataUri = typeof file === "string" ? file : await fileToBase64(file);
      return {
        url: dataUri,
        provider: "local_preview",
        isFallback: true
      };
    } catch {
      throw cloudErr;
    }
  }
}
