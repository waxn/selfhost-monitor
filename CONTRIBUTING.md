# Contributing to SelfHost Monitor

Thank you for your interest in contributing to SelfHost Monitor! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help create a welcoming environment for all contributors

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When creating a bug report, include:**
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details:
  - Deployment type (Cloud/Docker)
  - Browser and version
  - Operating system
  - Node.js version (for self-hosted)

**Template:**
```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - Deployment: [Cloud/Docker]
 - Browser: [e.g. Chrome 120]
 - OS: [e.g. Ubuntu 22.04]
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:
- Clear, descriptive title
- Detailed description of the proposed feature
- Why this feature would be useful
- Possible implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes**:
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
3. **Test your changes**:
   - Ensure the app builds successfully
   - Test both cloud and Docker modes (if applicable)
   - Verify no regressions
4. **Commit your changes**:
   - Use clear, descriptive commit messages
   - Reference issue numbers if applicable
5. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- (Optional) Docker for testing self-hosted mode

### Getting Started

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/selfhost-monitor.git
   cd selfhost-monitor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Convex** (for cloud mode development):
   ```bash
   npx convex dev
   ```
   This will create a `.env.local` file with your development Convex deployment.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

### Project Structure

```
selfhost-monitor/
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── auth.ts             # Authentication logic
│   ├── devices.ts          # Device CRUD operations
│   ├── services.ts         # Service CRUD operations
│   ├── serviceUrls.ts      # URL management
│   ├── uptime.ts           # Uptime monitoring
│   ├── crons.ts            # Scheduled jobs
│   ├── seed.ts             # Demo data seeding
│   └── encryption.ts       # Encryption utilities
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   │   ├── ServiceCard.svelte
│   │   │   ├── ServiceModal.svelte
│   │   │   ├── DeviceModal.svelte
│   │   │   └── DemoBanner.svelte
│   │   ├── convex.svelte.ts # Convex client setup
│   │   └── db/             # Database adapters
│   │       ├── adapter.ts
│   │       ├── convex-adapter.ts
│   │       └── sqlite-adapter.ts
│   ├── routes/
│   │   ├── +layout.svelte   # Root layout
│   │   ├── +page.svelte     # Landing page
│   │   ├── auth/+page.svelte # Auth page
│   │   └── dashboard/+page.svelte # Main dashboard
│   └── app.html
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any` when possible)
- Use interfaces for complex objects

```typescript
// Good
interface Service {
  name: string;
  deviceId?: string;
  urls: ServiceUrl[];
}

// Avoid
const service: any = { ... };
```

### Svelte Components

- Use Svelte 5 runes ($state, $derived, $effect)
- Keep components focused and reusable
- Use scoped styles
- Add prop types

```svelte
<script lang="ts">
  interface Props {
    title: string;
    isOpen: boolean;
  }

  let { title, isOpen }: Props = $props();
</script>
```

### Styling

- Use scoped CSS within components
- Follow existing color scheme (dark theme with orange accents)
- Ensure responsive design
- Use CSS variables for consistency

```css
/* Use existing variables */
color: #e8eaed;
background: #1e2329;
border: 1px solid #3a3f47;
accent: #d35400;
```

### Convex Backend

- Use proper validators (v.string(), v.id(), etc.)
- Add authorization checks in mutations
- Keep functions focused
- Add error handling

```typescript
export const updateService = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Authorization check
    const service = await ctx.db.get(args.id);
    if (service.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Update
    await ctx.db.patch(args.id, { name: args.name });
  },
});
```

## Testing

Currently, testing is manual. When running tests:

1. **Test both deployment modes**:
   - Cloud mode (with Convex)
   - Docker mode (with SQLite)

2. **Test user flows**:
   - Registration/login
   - Creating devices and services
   - Adding URLs
   - Viewing uptime status
   - Demo user experience

3. **Test edge cases**:
   - Empty states
   - Invalid inputs
   - Network failures
   - Long service names
   - Many URLs per service

## Documentation

When contributing, update relevant documentation:

- **README.md**: User-facing setup and usage
- **SECURITY.md**: Security-related changes
- **Inline comments**: Complex logic
- **JSDoc**: Public functions and types

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add encryption for service URLs
fix: Prevent duplicate device names
docs: Update Docker deployment guide
style: Format code with Prettier
refactor: Simplify uptime check logic
test: Add tests for auth flow
chore: Update dependencies
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

Examples:
- `feature/oauth-integration`
- `fix/uptime-check-timeout`
- `docs/docker-setup-guide`

## Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be recognized in release notes

## Questions?

- Open a GitHub issue with the `question` label
- Check existing issues and discussions
- Read the README and documentation

## Recognition

Contributors will be recognized in:
- Release notes
- GitHub contributors page
- Project documentation

Thank you for contributing to Self Host Monitor! 🎉
