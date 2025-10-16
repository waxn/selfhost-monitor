# Service Monitor

A self-hosted service monitoring dashboard built with Svelte and Convex. Track your services, monitor uptime, and manage multiple URLs for each service with a beautiful, modern UI.

## Features

- 📊 **Service Management** - Add, edit, and organize your services with custom icons
- 🖥️ **Device Organization** - Group services by device/VM
- 🔗 **Multiple URLs** - Add multiple URLs per service (e.g., "Local", "Web", "API")
- 📈 **Uptime Monitoring** - Automatic health checks every 5 minutes
- 🎨 **Modern UI** - Dark theme with gradient accents
- ⚡ **Real-time Updates** - Powered by Convex for instant data sync

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. Install dependencies:

```sh
npm install
```

2. Set up Convex:

```sh
npx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Generate your `.env.local` file with your Convex deployment URL
- Start the Convex backend in dev mode

3. In a separate terminal, start the development server:

```sh
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### Adding Devices

1. Click "Add Device" in the header
2. Enter device name and optional description
3. Click "Create"

### Adding Services

1. Click "Add Service" in the header
2. Fill in service details:
   - **Name** - Service name (e.g., "Homebox")
   - **Device** - Select which device it runs on
   - **Icon URL** - Optional image URL for the service icon
   - **Notes** - Optional description
   - **URLs** - Add one or more URLs with labels (e.g., "Local", "Web")
3. Click "Create"

### Managing Services

- **View Status** - Service cards show real-time uptime status with green (up) or red (down) indicators
- **Edit** - Click the hamburger menu (⋮) on a service card, then "Edit"
- **Delete** - Click the hamburger menu (⋮) on a service card, then "Delete"
- **Open URL** - Click any URL button to open in a new tab

### Uptime Monitoring

- Services are automatically checked every 5 minutes
- Response times are displayed on each URL button
- Status dots show:
  - 🟢 Green - Service is up
  - 🔴 Red - Service is down
  - ⚪ Gray - Not yet checked

## Deployment

### Build for Production

```sh
npm run build
```

### Deploy to Convex Production

1. Deploy your Convex backend:

```sh
npx convex deploy
```

2. Update `.env.local` with your production Convex URL

3. Deploy your Svelte app to your preferred hosting platform (Vercel, Netlify, etc.)

## Tech Stack

- **Frontend** - SvelteKit 2 with TypeScript
- **Backend** - Convex (serverless backend)
- **Styling** - Scoped CSS with CSS variables
- **Uptime Checks** - Convex scheduled functions (cron jobs)

## Project Structure

```
selfhost-monitor/
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   ├── devices.ts       # Device CRUD operations
│   ├── services.ts      # Service CRUD operations
│   ├── serviceUrls.ts   # URL management
│   ├── uptime.ts        # Uptime monitoring logic
│   └── crons.ts         # Scheduled uptime checks
├── src/
│   ├── lib/
│   │   └── components/  # Svelte components
│   │       ├── ServiceCard.svelte
│   │       ├── ServiceModal.svelte
│   │       └── DeviceModal.svelte
│   └── routes/
│       ├── +layout.svelte  # Root layout with Convex provider
│       └── +page.svelte    # Main dashboard page
└── static/              # Static assets
```

## License

MIT
