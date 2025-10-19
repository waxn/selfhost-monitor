# Encryption Implementation

SelfHost Monitor uses AES-256-GCM encryption to protect sensitive data stored in the database.

## What Gets Encrypted

The following fields are encrypted at the application level:

1. **Service URLs** (`serviceUrls.url`)
   - Protects private IP addresses
   - Protects internal network endpoints
   - Prevents exposure of network topology

2. **Service Notes** (`services.notes`)
   - May contain sensitive configuration details
   - May contain credentials or access information
   - User-provided free-form text

## Encryption Details

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 96 bits (12 bytes, randomly generated per encryption)
- **Implementation**: Web Crypto API (works in Convex runtime)

## Setup

### 1. Generate Encryption Key

```bash
npm run generate-key
```

This will output a 64-character hexadecimal string (32 bytes).

### 2. Add to Environment

Add the generated key to your `.env.local`:

```bash
ENCRYPTION_KEY=your_64_character_hex_key_here
```

### 3. Restart Your Application

The encryption key is loaded when the application starts.

## How It Works

### Encryption Flow

1. **User Input** → Frontend sends plaintext data
2. **Mutation Handler** → Encrypts data before storing
3. **Database** → Stores encrypted (base64-encoded) data
4. **Query Handler** → Decrypts data before returning
5. **Frontend** → Receives plaintext data

### Data Format

Encrypted data is stored as base64-encoded strings in the format:

```
base64(IV + encrypted_data)
```

- First 12 bytes: Initialization Vector (IV)
- Remaining bytes: Encrypted data with authentication tag

### Code Example

```typescript
import { encrypt, decrypt } from './convex/encryption';

// Encrypting
const encrypted = await encrypt('https://192.168.1.100:8080');
// Returns: "AQIDBA...base64..." (encrypted)

// Decrypting
const decrypted = await decrypt(encrypted);
// Returns: "https://192.168.1.100:8080" (original)
```

## Security Features

### Authentication

AES-GCM provides:
- **Encryption**: Data confidentiality
- **Authentication**: Data integrity and authenticity
- **AEAD**: Authenticated Encryption with Associated Data

### Key Security

The encryption key:
- Is stored only in environment variables
- Never sent to the client
- Never logged or exposed in errors
- Required for both encryption and decryption

### Graceful Degradation

If encryption fails:
- System falls back to storing plaintext
- Logs error for debugging
- Continues operation (availability over encryption)

If decryption fails:
- Returns `null` or falls back to encrypted value
- Allows handling of data encrypted with old keys
- Prevents application crashes

## Key Management

### Production Best Practices

1. **Generate Unique Keys**
   ```bash
   # Different key for each environment
   npm run generate-key  # Development
   npm run generate-key  # Staging
   npm run generate-key  # Production
   ```

2. **Backup Your Keys**
   - Store in password manager (1Password, LastPass, etc.)
   - Keep offline backup in secure location
   - Document key rotation procedures

3. **Environment Separation**
   - Never use the same key across environments
   - Dev keys != Staging keys != Production keys

4. **Key Rotation** (Advanced)
   - Generate new key
   - Decrypt all data with old key
   - Re-encrypt with new key
   - Update environment variable

### Docker Deployment

Add to `docker-compose.yml`:

```yaml
environment:
  - ENCRYPTION_KEY=${ENCRYPTION_KEY}
```

Or create `.env` file for Docker:

```bash
ENCRYPTION_KEY=your_key_here
```

### Cloud Deployment (Vercel/Netlify)

Add environment variable in hosting dashboard:

- **Name**: `ENCRYPTION_KEY`
- **Value**: Your generated key
- **Environment**: Production (and Preview if needed)

## Files Modified

### Core Encryption

- `convex/encryption.ts` - Encryption/decryption utilities
- `scripts/generate-encryption-key.js` - Key generation script

### Mutations (Encrypt on Write)

- `convex/services.ts` - Encrypts `notes` field
- `convex/serviceUrls.ts` - Encrypts `url` field

### Queries (Decrypt on Read)

- `convex/services.ts` - Decrypts `notes` and `urls`
- `convex/serviceUrls.ts` - Decrypts `url`

### Actions (Decrypt for Use)

- `convex/uptime.ts` - Decrypts URLs before HTTP requests

## Troubleshooting

### "ENCRYPTION_KEY environment variable not set"

**Solution**: Generate and add encryption key:

```bash
npm run generate-key
# Copy output to .env.local
```

### "ENCRYPTION_KEY must be exactly 64 hex characters"

**Solution**: Key must be 32 bytes (64 hexadecimal characters):

```bash
# Correct: 64 characters
ENCRYPTION_KEY=a1b2c3d4e5f6...

# Wrong: Too short
ENCRYPTION_KEY=abc123
```

### "Failed to decrypt data"

**Possible causes**:
1. Data was encrypted with a different key
2. Key was changed after data was encrypted
3. Data corruption

**Solution**:
- Restore correct encryption key from backup
- Or re-encrypt data with new key
- Check for database corruption

### Data Shows as Gibberish

If you see base64-encoded strings instead of plaintext:
1. Encryption key is missing or wrong
2. Decryption failed silently
3. Check console for decryption errors

## Performance Impact

### Minimal Overhead

- Encryption: ~1-2ms per field
- Decryption: ~1-2ms per field
- Uses native Web Crypto API (hardware accelerated)

### Caching Considerations

- Encrypted data is decrypted on every query
- Consider caching decrypted values in frontend if needed
- Database stores only encrypted values

## Migration from Unencrypted Data

If you have existing unencrypted data:

1. **New Data**: Automatically encrypted
2. **Old Data**: Remains unencrypted until updated
3. **Mixed State**: App handles both gracefully

To encrypt existing data:
- Edit and save each service/URL
- Or run a migration script (create if needed)

## Compliance

This encryption implementation helps with:

- **GDPR**: Data protection requirements
- **HIPAA**: PHI encryption requirements (if applicable)
- **SOC 2**: Encryption at rest requirements

**Note**: Full compliance requires additional security measures beyond encryption.

## FAQ

**Q: Can I disable encryption?**
A: Remove or comment out `ENCRYPTION_KEY` from `.env.local`. Data will be stored in plaintext.

**Q: What happens if I lose the encryption key?**
A: Encrypted data is **permanently** inaccessible. Always backup your key!

**Q: Can I change the encryption algorithm?**
A: Yes, modify `convex/encryption.ts`, but you'll need to re-encrypt all data.

**Q: Is the encryption key sent to the client?**
A: No, it only exists on the server (Convex runtime).

**Q: What about database backups?**
A: Backups contain encrypted data. You need the key to decrypt them.

## Support

For encryption-related issues:
- Check `SECURITY.md` for security policies
- Review Convex logs for encryption errors
- Open GitHub issue with `[ENCRYPTION]` tag

---

**Remember**: Encryption is only as strong as key management. Protect your encryption key!
