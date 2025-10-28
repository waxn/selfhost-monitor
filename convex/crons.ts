import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check URLs every 30 seconds (balance between responsiveness and function usage)
crons.interval(
  "check uptime",
  { seconds: 30 },
  internal.uptime.checkAllUrls
);

// Reset demo user data every 30 minutes
crons.interval(
  "reset demo data",
  { minutes: 30 },
  internal.seed.resetDemoData
);

export default crons;
