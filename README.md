# SelfHost Monitor

A self-hosted service monitoring dashboard built with SvelteKit and Convex. Track your services, monitor uptime, and manage multiple URLs for each service with a beautiful, modern UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](docs/DOCKER_DEPLOYMENT.md)

## ✨ Features

- 📊 **Service Management** - Add, edit, and organize your services with custom icons
- 🖥️ **Device Organization** - Group services by device/VM (optional)
- 🔗 **Multiple URLs** - Add multiple URLs per service (e.g., "Local", "Web", "API")
- 📈 **Uptime Monitoring** - Automatic health checks with configurable intervals
- 🎨 **Modern UI** - Dark theme with gradient accents
- ⚡ **Real-time Updates** - Powered by Convex for instant data sync
- 🔒 **Data Encryption** - AES-256-GCM encryption for sensitive data (URLs, notes)
- 🎭 **Demo Mode** - Try it out with pre-populated sample data
- 🐳 **Docker Ready** - Easy self-hosting with Docker Compose
- 🔓 **Open Source** - MIT licensed, community-driven

## 🚀 Quick Start

### Option 1: Try the Demo

Click "Try Demo" on the landing page to explore with pre-populated sample data. No account needed!

### Option 2: Cloud Deployment (Recommended)

Perfect for quick setup and automatic scaling.

**Prerequisites:**
- Node.js 18+
- Convex account (free at [convex.dev](https://convex.dev))

**Steps:**

```bash
# 1. Install dependencies
npm install

# 2. Set up Convex backend
npx convex dev
# This creates .env.local with your Convex URL

# 3. Generate encryption key
npm run generate-key
# Add output to .env.local

# 4. Start development server
npm run dev

# 5. Open http://localhost:5173
```

### Option 3: Docker Self-Hosting

Perfect for running on your own infrastructure.

```bash
# 1. Clone repository
git clone https://github.com/yourusername/selfhost-monitor.git
cd selfhost-monitor

# 2. Configure environment
cp .env.docker .env
# Edit .env with your Convex URL and encryption key

# 3. Start with Docker Compose
docker-compose up -d

# 4. Access at http://localhost:3000
```

**Full Docker guide**: [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)

## 📖 Documentation

- **[Getting Started](#getting-started)** - Detailed setup instructions
- **[Docker Deployment](docs/DOCKER_DEPLOYMENT.md)** - Self-hosting with Docker
- **[Encryption Guide](docs/ENCRYPTION.md)** - Data encryption setup
- **[Security Policy](SECURITY.md)** - Security features and limitations
- **[Contributing](CONTRIBUTING.md)** - How to contribute
- **[Demo Setup](DEMO_SETUP.md)** - Demo user configuration

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```bash
# Required: Convex deployment URL
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Required: Encryption key (generate with: npm run generate-key)
ENCRYPTION_KEY=your_64_character_hex_key

# Optional: Demo mode
PUBLIC_DEMO_MODE=false
```

### Encryption

SelfHost Monitor encrypts sensitive data:

- **Service URLs** - Protects private IPs and internal endpoints
- **Service Notes** - Protects sensitive configuration details

**Generate encryption key:**

```bash
npm run generate-key
```

Add the output to your `.env.local` file.

**More info**: [docs/ENCRYPTION.md](docs/ENCRYPTION.md)

## 📱 Usage

### Adding Services

1. Click "Add Service" in the header
2. Fill in details:
   - **Name** - Service name (required)
   - **Device** - Which device it runs on (optional)
   - **Icon URL** - Custom icon (optional)
   - **Notes** - Sensitive info is encrypted
   - **URLs** - One or more endpoints with labels
3. Click "Create"

### Managing Services

- **View Status** - Real-time uptime indicators
- **Edit** - Click menu (⋮) → "Edit"
- **Delete** - Click menu (⋮) → "Delete"
- **Open URL** - Click any URL button

### Uptime Monitoring

- Configurable check intervals (default: 5 minutes)
- Response time tracking
- Status indicators:
  - 🟢 Up - Service responding
  - 🔴 Down - Service not responding
  - ⚪ Pending - Not yet checked
- Exclude URLs from monitoring with checkbox

## 🚢 Deployment

### Vercel / Netlify

```bash
# Build frontend
npm run build

# Deploy Convex backend
npx convex deploy --prod

# Deploy frontend to Vercel/Netlify
# Add VITE_CONVEX_URL and ENCRYPTION_KEY as environment variables
```

### Docker

See [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md) for complete guide.

```bash
# Quick start
docker-compose up -d
```

## 🛠️ Development

### Project Structure

```
selfhost-monitor/
├── convex/                 # Backend
│   ├── schema.ts           # Database schema
│   ├── auth.ts             # Authentication
│   ├── services.ts         # Service operations
│   ├── serviceUrls.ts      # URL management
│   ├── uptime.ts           # Uptime monitoring
│   ├── encryption.ts       # Data encryption
│   ├── seed.ts             # Demo data
│   └── crons.ts            # Scheduled jobs
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   │   ├── ServiceCard.svelte
│   │   │   ├── ServiceModal.svelte
│   │   │   ├── DeviceModal.svelte
│   │   │   └── DemoBanner.svelte
│   │   └── convex.svelte.ts
│   └── routes/
│       ├── +page.svelte            # Landing page
│       ├── auth/+page.svelte       # Authentication
│       ├── dashboard/+page.svelte  # Main dashboard
│       ├── privacy/+page.svelte    # Privacy policy
│       └── terms/+page.svelte      # Terms of service
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── Dockerfile             # Docker configuration
└── docker-compose.yml     # Docker Compose setup
```

### Tech Stack

- **Frontend**: SvelteKit 2 + TypeScript + Svelte 5
- **Backend**: Convex (serverless)
- **Styling**: Scoped CSS with CSS variables
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Authentication**: PBKDF2-SHA256 (demo/personal use)
- **Deployment**: Docker, Vercel, Netlify

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type check
npm run generate-key # Generate encryption key
```

## 🔒 Security

- ✅ Password hashing (PBKDF2-SHA256, 120k iterations)
- ✅ Data encryption (AES-256-GCM)
- ✅ User data isolation
- ✅ Input validation
- ⚠️ Demo authentication (not for production multi-user)

**See [SECURITY.md](SECURITY.md) for security policy and known limitations.**

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Backend by [Convex](https://convex.dev)
- Icons and design inspired by modern dashboard UIs

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/selfhost-monitor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/selfhost-monitor/discussions)
- **Documentation**: [docs/](docs/)

## 🗺️ Roadmap

- [ ] Historical uptime graphs
- [ ] Email/webhook notifications
- [ ] Mobile app
- [ ] Multi-user with role-based access
- [ ] Metrics dashboard
- [ ] Custom alerting rules

---

**⭐ Star this repository if you find it helpful!**
