import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check all URLs every 5 minutes
crons.interval(
  "check uptime",
  { minutes: 5 },
  internal.uptime.checkAllUrls
);

export default crons;
