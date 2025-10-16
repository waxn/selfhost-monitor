import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check URLs every minute (individual URLs respect their own intervals)
crons.interval(
  "check uptime",
  { minutes: 1 },
  internal.uptime.checkAllUrls
);

export default crons;
