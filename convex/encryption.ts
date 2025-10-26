/**
 * Encryption utilities for sensitive data using AES-256-GCM
 * Uses Web Crypto API which is available in Convex runtime
 */

// Convert string to Uint8Array with proper ArrayBuffer
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  // Create a new Uint8Array with a proper ArrayBuffer
  const buffer = new ArrayBuffer(encoded.length);
  const result = new Uint8Array(buffer);
  result.set(encoded);
  return result;
}

// Convert Uint8Array to string
function uint8ArrayToString(arr: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(arr);
}

// Convert Uint8Array to base64
function uint8ArrayToBase64(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(arr)));
}

// Convert base64 to Uint8Array with proper ArrayBuffer
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const buffer = new ArrayBuffer(binaryString.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Get or validate encryption key from environment
// In Convex, environment variables must be accessed through the ctx parameter
// This function will be called with the key passed from the mutation/query
function getEncryptionKey(key: string | undefined): string {
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable not set. " +
      "Generate one with: openssl rand -hex 32"
    );
  }
  // Key should be 32 bytes (64 hex characters) for AES-256
  if (key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes) for AES-256"
    );
  }
  return key;
}

// Convert hex string to Uint8Array with proper ArrayBuffer
function hexToUint8Array(hex: string): Uint8Array {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Import the encryption key
async function importKey(keyHex: string): Promise<CryptoKey> {
  const keyBytes = hexToUint8Array(keyHex);

  return await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a string value
 * Returns base64-encoded encrypted data with IV prepended
 * Format: base64(IV + encrypted_data)
 * If no encryption key is provided, returns the plaintext unencrypted
 */
export async function encrypt(plaintext: string | null | undefined, encryptionKey: string | undefined): Promise<string | null> {
  // Handle null/undefined values
  if (plaintext === null || plaintext === undefined || plaintext === "") {
    return null;
  }

  // If no encryption key, return plaintext
  if (!encryptionKey) {
    return plaintext;
  }

  try {
    const keyHex = getEncryptionKey(encryptionKey);
    const key = await importKey(keyHex);

    // Generate random IV (12 bytes for GCM)
    const ivBuffer = new ArrayBuffer(12);
    const iv = crypto.getRandomValues(new Uint8Array(ivBuffer));

    // Encrypt the data
    const encodedText = stringToUint8Array(plaintext);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedText.buffer as ArrayBuffer
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);

    // Return as base64
    return uint8ArrayToBase64(combined);
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error(`Failed to encrypt data: ${error}`);
  }
}

/**
 * Decrypt a string value
 * Expects base64-encoded data with IV prepended
 * If no encryption key is provided, returns the data as-is (assuming it's unencrypted)
 */
export async function decrypt(encryptedData: string | null | undefined, encryptionKey: string | undefined): Promise<string | null> {
  // Handle null/undefined values
  if (encryptedData === null || encryptedData === undefined || encryptedData === "") {
    return null;
  }

  // If no encryption key, return data as-is
  if (!encryptionKey) {
    return encryptedData;
  }

  // Check if data looks like it might be unencrypted (URL or plain text)
  // URLs and plain text won't be valid base64 or will be too short for encrypted data
  const looksLikeUrl = encryptedData.startsWith('http://') || encryptedData.startsWith('https://');
  const tooShortForEncrypted = encryptedData.length < 16; // Encrypted data should be at least 16 chars (IV + some data)

  if (looksLikeUrl || tooShortForEncrypted) {
    // This is likely unencrypted data, return as-is
    return encryptedData;
  }

  try {
    const keyHex = getEncryptionKey(encryptionKey);
    const key = await importKey(keyHex);

    // Decode from base64
    const combined = base64ToUint8Array(encryptedData);

    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedArray = combined.slice(12);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedArray.buffer as ArrayBuffer
    );

    const decryptedArray = new Uint8Array(decryptedBuffer);
    return uint8ArrayToString(decryptedArray);
  } catch (error) {
    console.error("Decryption error:", error);
    // If decryption fails, the data might be unencrypted, return it as-is
    // This allows graceful handling of data that was stored before encryption was enabled
    return encryptedData;
  }
}

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(encryptionKey: string | undefined): boolean {
  try {
    getEncryptionKey(encryptionKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypt multiple fields in an object
 * Returns new object with specified fields encrypted
 */
export async function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  encryptionKey: string | undefined
): Promise<T> {
  const result = { ...obj };

  for (const field of fields) {
    if (typeof obj[field] === 'string') {
      result[field] = await encrypt(obj[field] as string, encryptionKey) as any;
    }
  }

  return result;
}

/**
 * Decrypt multiple fields in an object
 * Returns new object with specified fields decrypted
 */
export async function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  encryptionKey: string | undefined
): Promise<T> {
  const result = { ...obj };

  for (const field of fields) {
    if (typeof obj[field] === 'string') {
      result[field] = await decrypt(obj[field] as string, encryptionKey) as any;
    }
  }

  return result;
}
