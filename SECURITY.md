# Security Policy

## Security Model

SelfHost Monitor is designed for personal and small team use to monitor self-hosted services. This document outlines the security features and known limitations.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

## Security Features

### 1. Password Security
- **PBKDF2-SHA256** password hashing with 120,000 iterations
- Random 16-byte salt per user
- Constant-time password comparison to prevent timing attacks
- Password hashes never exposed in API responses

### 2. Data Encryption
- **Application-level encryption** for sensitive service data
- AES-256-GCM encryption for:
  - Service URLs (protects private IPs and internal endpoints)
  - Service notes (may contain sensitive information)
- Encryption keys stored in environment variables
- Transparent encryption/decryption in all database operations

### 3. Data Isolation
- User-based data segregation using indexed queries
- Authorization checks on all mutations
- Users can only access their own data

### 4. Transport Security
- HTTPS/TLS enforced in production deployments
- Secure WebSocket connections for real-time updates (Convex cloud mode)

## Known Limitations

### Authentication System

⚠️ **Important**: The current authentication system is designed for **demo and personal use** only. It is NOT suitable for production multi-user deployments without additional security hardening.

**Current Limitations:**
- No email verification
- No password reset mechanism
- No two-factor authentication (2FA)
- No rate limiting on login attempts
- Client-side session management (user ID in localStorage)
- No CSRF protection
- No session expiration or refresh tokens

**Recommendations for Production Use:**
- Implement proper JWT-based authentication
- Add rate limiting on authentication endpoints
- Implement email verification
- Add password reset functionality
- Consider integrating with OAuth providers (Google, GitHub, etc.)
- Add session management with expiration
- Implement CSRF tokens

### Docker/Self-Hosted Deployments

When self-hosting via Docker:
- Ensure `ENCRYPTION_KEY` is securely generated and stored
- Back up your encryption key securely - lost keys = lost data
- Use strong passwords for all accounts
- Keep Docker images updated
- Run behind a reverse proxy (nginx/Caddy) with HTTPS
- Restrict network access to trusted networks
- Regularly backup your SQLite database

### Cloud Deployments (Convex)

When using the cloud version:
- Convex handles backend security and data isolation
- Data is stored in Convex's cloud infrastructure
- Review Convex's security policies at https://www.convex.dev/security
- Demo mode resets data every 30 minutes

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **Email**: Create an issue on GitHub with the tag [SECURITY] (for non-critical issues)
2. **Critical Issues**: For critical vulnerabilities, please contact the maintainers directly

**Please do NOT:**
- Open a public GitHub issue for critical security vulnerabilities
- Disclose the vulnerability publicly before we've had a chance to address it

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will work to patch critical vulnerabilities as quickly as possible

## Best Practices for Users

### For Self-Hosting (Docker)

1. **Environment Variables**
   ```bash
   # Generate a strong encryption key
   npm run generate-key

   # Store in .env file (NEVER commit to git)
   ENCRYPTION_KEY=your-generated-key-here
   ```

2. **Reverse Proxy Configuration**
   - Always run behind HTTPS (use Let's Encrypt/Caddy)
   - Set appropriate security headers
   - Implement rate limiting at proxy level

3. **Backup Strategy**
   - Regular backups of SQLite database
   - Securely store encryption key separately
   - Test restoration process

4. **Access Control**
   - Use firewall rules to restrict access
   - VPN for remote access
   - Consider Tailscale/WireGuard for private network access

### For Cloud Hosting (Convex)

1. **API Keys**
   - Keep `VITE_CONVEX_URL` private
   - Rotate deployment keys if exposed
   - Use different deployments for dev/prod

2. **User Management**
   - Use strong, unique passwords
   - Don't share accounts
   - Monitor for unusual activity

## Security Roadmap

Future improvements planned:

- [ ] OAuth2 integration (Google, GitHub)
- [ ] Two-factor authentication (2FA/TOTP)
- [ ] Rate limiting on API endpoints
- [ ] Session management with JWT tokens
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Audit logging
- [ ] IP-based access restrictions
- [ ] Automatic security updates notification

## Compliance

This software is provided "as is" for personal use. For compliance-critical deployments:

- Conduct your own security audit
- Implement additional security controls as needed
- Follow your organization's security policies
- Consider professional security consulting

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Convex Security](https://www.convex.dev/security)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## License

This security policy is part of the SelfHost Monitor project, licensed under MIT License.

---

**Last Updated**: 2025-10-18
