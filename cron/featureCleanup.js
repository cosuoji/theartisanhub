import cron from "node-cron";
import User from "../models/User.js";

/**
 * CRON JOB: Auto-unfeature artisans whose featuredUntil date has expired.
 * Runs every day at midnight (00:00)
 */
export const scheduleFeatureCleanup = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running daily artisan feature cleanup...");

    try {
      const result = await User.updateMany(
        {
          role: "artisan",
          "artisanProfile.featuredUntil": { $lte: new Date() },
        },
        {
          $set: {
            "artisanProfile.featuredUntil": null,
            "artisanProfile.isCurrentlyFeatured": false,
          },
        }
      );

      console.log(`[CRON] Unfeatured ${result.modifiedCount} expired artisans.`);
    } catch (error) {
      console.error("[CRON] Feature cleanup failed:", error);
    }
  });
};

export const runInitialFeatureCleanup = async () => {
  try {
    const result = await User.updateMany(
      {
        role: "artisan",
        "artisanProfile.featuredUntil": { $lte: new Date() },
      },
      {
        $set: {
          "artisanProfile.featuredUntil": null,
          "artisanProfile.isCurrentlyFeatured": false,
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[INIT] Cleaned up ${result.modifiedCount} expired featured artisans.`);
    }
  } catch (error) {
    console.error("[INIT] Feature cleanup failed:", error);
  }
};
