import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check URLs every 10 seconds for immediate alerting
crons.interval(
  "check uptime",
  { seconds: 10 },
  internal.uptime.checkAllUrls
);

// Reset demo user data every 30 minutes
crons.interval(
  "reset demo data",
  { minutes: 30 },
  internal.seed.resetDemoData
);

export default crons;
