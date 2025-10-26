import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Use Web Crypto (SubtleCrypto) so the file runs in Convex's default
// runtime (which allows query functions). We'll use PBKDF2 with SHA-256.

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  if (!hex) return new Uint8Array();
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations = 120000, dkLen = 64) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  // Ensure salt is a plain ArrayBuffer (not a SharedArrayBuffer) and
  // only contains the relevant bytes for these views. This avoids a
  // TS complaint about BufferSource types.
  // Create a fresh copy to ensure we get a plain ArrayBuffer (not SharedArrayBuffer)
  const saltBuffer = salt.slice().buffer;
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    dkLen * 8
  );
  return new Uint8Array(derivedBits);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function serializeHash(salt: Uint8Array, derivedKey: Uint8Array) {
  return `${toHex(salt)}:${toHex(derivedKey)}`;
}

function parseHash(stored: string) {
  const [saltHex, keyHex] = stored.split(":");
  return { salt: fromHex(saltHex), key: fromHex(keyHex) };
}

export const register = mutation({
  args: { email: v.string(), password: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Check for existing by email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with that email already exists");
    }

    // Generate salt and derive key using PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await pbkdf2(args.password, salt, 120000, 64);
    const passwordHash = serializeHash(salt, derivedKey);

    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || !user.passwordHash) {
      // Do not reveal whether the email exists
      return null;
    }

    try {
      const { salt, key } = parseHash(user.passwordHash);
      const derived = await pbkdf2(args.password, salt, 120000, key.length);

      // Constant-time comparison
      if (!constantTimeEqual(derived, key)) return null;
      return user._id;
    } catch (e) {
      return null;
    }
  },
});

export const getUser = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      // Convert string to Id type - Convex will validate it
      const user = await ctx.db.get(args.id as any);
      if (!user) return null;
      const { passwordHash, ...rest } = user as any;
      return rest;
    } catch (error) {
      console.error("Error in getUser:", error);
      return null;
    }
  },
});
