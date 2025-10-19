import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check URLs every minute (individual URLs respect their own intervals)
crons.interval(
  "check uptime",
  { minutes: 1 },
  internal.uptime.checkAllUrls
);

// Reset demo user data every 30 minutes
crons.interval(
  "reset demo data",
  { minutes: 30 },
  internal.seed.resetDemoData
);

export default crons;
