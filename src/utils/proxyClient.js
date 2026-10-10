/**
 * Proxy Client with HMAC-SHA256 Handshake Security
 * Connects directly to Wasmer Edge PHP proxy (https://devclub.wasmer.app).
 * 
 * SECURITY: NEVER stores API keys or secrets in localStorage or cookies.
 * All credentials remain strictly in volatile memory.
 */

export const SHARED_API_SECRET = "super_secure_shared_secret_key_2026";
export const PROXY_PRIMARY_HOST = "https://devclub.wasmer.app";

// In-memory runtime cache only (NO localStorage persistence)
let inMemoryFirebaseConfig = null;
let inMemoryCloudinaryConfig = null;

// Purge any legacy API keys from localStorage if previously stored
if (typeof localStorage !== "undefined") {
  try {
    localStorage.removeItem("mocosn_firebase_proxy_config");
    localStorage.removeItem("mocosn_cloudinary_api_key");
    localStorage.removeItem("mocosn_cloudinary_cloud_name");
    localStorage.removeItem("mocosn_cloudinary_upload_preset");
  } catch {}
}

/**
 * Standard W3C Web Cryptography HMAC-SHA256 calculation
 * Supported in 100% of modern browsers (Chrome, Firefox, Safari, Edge, Android, iOS)
 */
export async function computeHmacSha256(message, secret = SHARED_API_SECRET) {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        enc.encode(message)
      );
      return Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch (err) {
    console.warn("crypto.subtle HMAC failed, falling back to pure JS:", err);
  }

  // Fallback pure JS SHA256 if subtle is unavailable in non-secure/embedded iframe contexts
  return fallbackHmacSha256(message, secret);
}

// Universal Pure JS SHA256 / HMAC Fallback
function fallbackSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = "length";
  let i, j;
  let result = "";
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = (fallbackSha256.h = fallbackSha256.h || []);
  const k = (fallbackSha256.k = fallbackSha256.k || []);
  let primeCounter = k[lengthProperty];
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += "\x80";
  while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return "";
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (((w[i - 16] + s0) | 0) + ((w[i - 7] + s1) | 0)) | 0;
      const s1_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const t2 = (s1_maj + maj) | 0;
      const s0_ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const t1 = (((((hash[7] + s0_ch) | 0) + ch) | 0) + ((k[i] + w[i]) | 0)) | 0;
      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
      hash.pop();
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return String.fromCharCode.apply(String, bytes);
}

function fallbackHmacSha256(message, secret) {
  let key = secret;
  const blockSize = 64;
  if (key.length > blockSize) {
    key = hexToBytes(fallbackSha256(key));
  }
  while (key.length < blockSize) {
    key += "\x00";
  }
  let oKeyPad = "";
  let iKeyPad = "";
  for (let i = 0; i < blockSize; i++) {
    oKeyPad += String.fromCharCode(key.charCodeAt(i) ^ 0x5c);
    iKeyPad += String.fromCharCode(key.charCodeAt(i) ^ 0x36);
  }
  const innerHash = hexToBytes(fallbackSha256(iKeyPad + message));
  return fallbackSha256(oKeyPad + innerHash);
}

/**
 * Determine best URL candidates for reaching the proxy endpoints
 * Prioritizes the deployed Wasmer Edge host (https://devclub.wasmer.app)
 */
export function getProxyEndpoints(endpoint = "") {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const envUrl = import.meta.env?.VITE_PROXY_API_URL || "";

  const candidates = [];
  if (envUrl) {
    candidates.push(`${envUrl.replace(/\/$/, "")}${cleanEndpoint}`);
  }
  // 1. Primary Live Wasmer Edge deployment
  candidates.push(`https://devclub.wasmer.app${cleanEndpoint}`);
  candidates.push(`https://devclub.wasmer.app/api${cleanEndpoint}`);
  candidates.push(`https://devclub.wasmer.app/index.php${cleanEndpoint}`);

  // 2. Relative paths when deployed on same origin
  candidates.push(`/php/index.php${cleanEndpoint}`);
  candidates.push(`/php/index.php`);

  // 3. Localhost development environments
  candidates.push(`http://localhost:8000${cleanEndpoint}`);
  candidates.push(`http://localhost:8000/index.php${cleanEndpoint}`);
  candidates.push(`http://localhost/NBA_VLSI_WEBSITE/php/index.php${cleanEndpoint}`);

  return candidates;
}

/**
 * Make an HMAC-authenticated POST call to the PHP proxy.
 */
export async function callProxy(endpoint, payload = {}) {
  const action = endpoint.replace(/^\/?(api\/)?/, "");
  const bodyString = JSON.stringify({ ...payload, action });

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await computeHmacSha256(`${timestamp}${bodyString}`, SHARED_API_SECRET);

  const headers = {
    "Content-Type": "application/json",
    "X-Timestamp": String(timestamp),
    "X-Signature": signature
  };

  const candidateUrls = getProxyEndpoints(endpoint);
  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: bodyString
      });

      if (res.ok) {
        return await res.json();
      }

      const errText = await res.text();
      try {
        const errJson = JSON.parse(errText);
        if (errJson && errJson.error) {
          lastError = new Error(`Proxy error (${res.status}): ${typeof errJson.error === "string" ? errJson.error : JSON.stringify(errJson.error)}`);
        }
      } catch {
        lastError = new Error(`Proxy response ${res.status}: ${errText.slice(0, 100)}`);
      }
    } catch (netErr) {
      lastError = netErr;
    }
  }

  throw lastError || new Error("Failed to reach PHP proxy endpoint.");
}

/**
 * Fetch verified Firebase Configuration from the PHP proxy.
 * Kept purely IN-MEMORY — NEVER saved to localStorage.
 */
export async function fetchFirebaseConfigFromProxy() {
  if (inMemoryFirebaseConfig) {
    return inMemoryFirebaseConfig;
  }

  try {
    const data = await callProxy("/firebase-config");
    if (data && data.apiKey && data.projectId) {
      inMemoryFirebaseConfig = data;
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch Firebase config from PHP proxy (using fallback):", err.message);
  }

  return inMemoryFirebaseConfig;
}

/**
 * Fetch Cloudinary Configuration from the PHP proxy.
 * Kept purely IN-MEMORY — NEVER saved to localStorage.
 */
export async function fetchCloudinaryConfigFromProxy() {
  if (inMemoryCloudinaryConfig) {
    return inMemoryCloudinaryConfig;
  }

  try {
    const data = await callProxy("/cloudinary-config");
    if (data && data.cloudName) {
      inMemoryCloudinaryConfig = data;
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch Cloudinary config from PHP proxy:", err.message);
  }

  return inMemoryCloudinaryConfig;
}

/**
 * Upload image via PHP proxy server.
 * All credentials remain server-side; client only sends image and receives URL.
 */
export async function uploadImageViaProxy(base64Image) {
  const data = await callProxy("/upload-cloudinary", { image: base64Image });
  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    provider: "cloudinary"
  };
}

/**
 * Perform a live health check of the proxy server
 * NEVER exposes or returns raw API keys.
 */
export async function checkProxyHealth() {
  const t0 = performance.now();
  try {
    const fb = await callProxy("/firebase-config");
    const latency = Math.round(performance.now() - t0);

    return {
      ok: true,
      host: PROXY_PRIMARY_HOST,
      latencyMs: latency,
      firebaseConnected: Boolean(fb?.projectId),
      proxyReady: true
    };
  } catch (err) {
    return {
      ok: false,
      host: PROXY_PRIMARY_HOST,
      error: err.message
    };
  }
}
