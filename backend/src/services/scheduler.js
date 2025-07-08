import cron from "node-cron";
import { getSubscriptions } from "./subscriptionService.js";
import {
  fetchGeneralNewsForEmail,
  fetchOverallSentimentForEmail,
} from "./newsFetchForEmailService.js";
import {
  generatePortfolioAlertsEmailHtml,
  sendEmail,
} from "./notificationService.js";

const sendDailyDigests = async () => {
  console.log(
    `[Scheduler] Running daily digest task at ${new Date().toISOString()}...`
  );
  const subscriptions = await getSubscriptions();

  let generalSentiment = null;
  let generalArticles = [];

  try {
    generalSentiment = await fetchOverallSentimentForEmail();
    generalArticles = await fetchGeneralNewsForEmail();
  } catch (error) {
    console.error(
      "[Scheduler Error] Error fetching general data for daily digest:",
      error
    );
  }

  for (const sub of subscriptions) {
    if (sub.frequency === "daily" && sub.email && sub.notificationTypes) {
      if (
        sub.notificationTypes.generalSummary &&
        generalArticles &&
        generalSentiment
      ) {
        try {
          const htmlContent = generateGeneralNewsEmailHtml(
            generalSentiment,
            generalArticles
          );
          await sendEmail(
            sub.email,
            "Your Daily Smart News Portfolio Digest",
            htmlContent
          );
          console.log(`[Scheduler] Sent general digest to ${sub.email}`);
        } catch (error) {
          console.error(
            `[Scheduler Error] Failed to send general digest to ${sub.email}:`,
            error
          );
        }
      }

      if (
        sub.notificationTypes.portfolioAlerts &&
        sub.portfolioSymbols &&
        sub.portfolioSymbols.length > 0
      ) {
        try {
          const portfolioArticles = await fetchFilteredNewsForEmail(
            sub.portfolioSymbols
          );
          if (portfolioArticles.length > 0) {
            const htmlContent = generatePortfolioAlertsEmailHtml(
              portfolioArticles,
              sub.email
            );
            await sendEmail(
              sub.email,
              "Your Personalized Portfolio News Alert",
              htmlContent
            );
            console.log(
              `[Scheduler] Sent portfolio alerts to ${
                sub.email
              } for symbols: ${sub.portfolioSymbols.join(", ")}`
            );
          } else {
            console.log(
              `[Scheduler] No new portfolio news found for ${
                sub.email
              } (${sub.portfolioSymbols.join(", ")})`
            );
          }
        } catch (error) {
          console.error(
            `[Scheduler Error] Failed to send portfolio alerts to ${sub.email}:`,
            error
          );
        }
      }
    }
  }
  console.log("[Scheduler] Daily digest task finished.");
};

export const startSchedulers = () => {
  // Schedule daily digest to run every day at 8:00 AM IST
  // CRON format: minute hour day_of_month month day_of_week
  // Example: '0 8 * * *' means 0 minutes, 8 hour, every day, every month, every day of the week
  cron.schedule("0 8 * * *", sendDailyDigests, {
    timezone: "Asia/Kolkata", // IMPORTANT: Set to your desired timezone for accurate scheduling
  });
  console.log("Scheduler: Daily digest scheduled for 8:00 AM IST.");
};
