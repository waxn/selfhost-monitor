#!/usr/bin/env node

/**
 * Generate a secure encryption key for AES-256-GCM
 *
 * Usage: node scripts/generate-encryption-key.js
 *
 * This will generate a 32-byte (256-bit) key encoded as 64 hexadecimal characters.
 * Add this to your .env.local file as:
 * ENCRYPTION_KEY=<generated_key>
 */

const crypto = require('crypto');

function generateEncryptionKey() {
  // Generate 32 random bytes (256 bits for AES-256)
  const key = crypto.randomBytes(32);

  // Convert to hexadecimal string
  const keyHex = key.toString('hex');

  return keyHex;
}

// Generate and display the key
const key = generateEncryptionKey();

console.log('\n' + '='.repeat(70));
console.log('  ENCRYPTION KEY GENERATED');
console.log('='.repeat(70));
console.log('\nYour new encryption key (keep this secret and backed up!):\n');
console.log(`  ENCRYPTION_KEY=${key}`);
console.log('\n' + '='.repeat(70));
console.log('  SETUP INSTRUCTIONS');
console.log('='.repeat(70));
console.log('\n1. Add this to your .env.local file:');
console.log(`   ENCRYPTION_KEY=${key}`);
console.log('\n2. IMPORTANT: Back up this key securely!');
console.log('   - Store it in a password manager');
console.log('   - Keep it in a secure location');
console.log('   - Without this key, encrypted data CANNOT be recovered');
console.log('\n3. For production deployments:');
console.log('   - Add this to your hosting provider\'s environment variables');
console.log('   - Never commit this key to git');
console.log('   - Use different keys for dev/staging/production');
console.log('\n4. For Docker deployments:');
console.log('   - Add to docker-compose.yml environment section');
console.log('   - Or create a separate .env file for Docker');
console.log('\n' + '='.repeat(70));
console.log('  SECURITY NOTES');
console.log('='.repeat(70));
console.log('\n- Key length: 32 bytes (256 bits)');
console.log('- Algorithm: AES-256-GCM');
console.log('- If you lose this key, encrypted data is PERMANENTLY LOST');
console.log('- Rotating keys requires re-encrypting all data');
console.log('\n' + '='.repeat(70) + '\n');