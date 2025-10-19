/**
 * Encryption utilities for sensitive data using AES-256-GCM
 * Uses Web Crypto API which is available in Convex runtime
 */

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
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

// Convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Get or validate encryption key from environment
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable not set. " +
      "Generate one with: node scripts/generate-encryption-key.js"
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

// Convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Import the encryption key
async function importKey(): Promise<CryptoKey> {
  const keyHex = getEncryptionKey();
  const keyBytes = hexToUint8Array(keyHex);

  return await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a string value
 * Returns base64-encoded encrypted data with IV prepended
 * Format: base64(IV + encrypted_data)
 */
export async function encrypt(plaintext: string | null | undefined): Promise<string | null> {
  // Handle null/undefined values
  if (plaintext === null || plaintext === undefined || plaintext === "") {
    return null;
  }

  try {
    const key = await importKey();

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encodedText = stringToUint8Array(plaintext);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedText
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
 */
export async function decrypt(encryptedData: string | null | undefined): Promise<string | null> {
  // Handle null/undefined values
  if (encryptedData === null || encryptedData === undefined || encryptedData === "") {
    return null;
  }

  try {
    const key = await importKey();

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
      encryptedArray
    );

    const decryptedArray = new Uint8Array(decryptedBuffer);
    return uint8ArrayToString(decryptedArray);
  } catch (error) {
    console.error("Decryption error:", error);
    // Return null on decryption failure rather than throwing
    // This allows graceful handling of data encrypted with old keys
    return null;
  }
}

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
  try {
    getEncryptionKey();
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
  fields: (keyof T)[]
): Promise<T> {
  const result = { ...obj };

  for (const field of fields) {
    if (typeof obj[field] === 'string') {
      result[field] = await encrypt(obj[field] as string) as any;
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
  fields: (keyof T)[]
): Promise<T> {
  const result = { ...obj };

  for (const field of fields) {
    if (typeof obj[field] === 'string') {
      result[field] = await decrypt(obj[field] as string) as any;
    }
  }

  return result;
}
