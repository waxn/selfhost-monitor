# Demo User Setup

The demo user is automatically initialized when someone clicks "Try Demo" on the website. However, if you need to manually initialize or reset the demo user, follow these instructions:

## Auto-Initialization

The demo user (`demo@selfhost-monitor.app` / password: `demo`) is automatically created when:
- Someone clicks "Try Demo" on the landing page
- Someone clicks "Try Demo Account" on the auth page
- Someone visits `/auth?mode=demo`

The system safely checks if the demo user exists and creates it if needed. It's safe to call multiple times.

## Manual Initialization (Optional)

If you want to manually initialize the demo user, you can call the mutation directly:

### Using Convex Dashboard

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to the "Functions" tab
4. Find and run `seed:initDemoUser`
5. No arguments needed

### Using Code

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api';

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);
await client.mutation(api.seed.initDemoUser, {});
```

## Demo User Details

- **Email**: `demo@selfhost-monitor.app`
- **Password**: `demo`
- **Reset Schedule**: Every 30 minutes (via cron job)

## Pre-populated Data

The demo account includes:

### Devices
1. **Home Server** - Main infrastructure - Dell PowerEdge R720
2. **VPS-01** - Cloud services - DigitalOcean Droplet

### Services
1. **Nextcloud** - Cloud storage (2 URLs)
2. **Plex Media Server** - Media streaming (1 URL)
3. **GitLab** - Git repository (2 URLs)
4. **Homebox** - Home inventory (1 URL)
5. **Grafana** - Monitoring dashboards (1 URL)

### Uptime Data
- Pre-populated with 1 hour of historical uptime checks
- ~90% uptime simulation for realistic appearance

## Troubleshooting

### Demo login fails

1. Check browser console for errors
2. Verify Convex is connected (`npx convex dev` running)
3. Check `.env.local` has correct `VITE_CONVEX_URL`
4. Try manually calling `api.seed.initDemoUser` from Convex dashboard

### Demo user exists but data is missing

The demo reset cron job might have cleared data. Either:
- Wait for the next 30-minute reset cycle (it recreates data)
- Manually call `internal.seed.resetDemoData` from Convex dashboard

### Need to fully reset demo user

1. Delete the demo user from Convex dashboard (Users table)
2. Delete all associated devices, services, and URLs
3. Click "Try Demo" again to recreate

## Cron Jobs

The system runs these automatic jobs:

- **Uptime checks**: Every 1 minute (checks all non-excluded URLs)
- **Demo reset**: Every 30 minutes (resets demo user data to initial state)

Both are defined in `convex/crons.ts`.
