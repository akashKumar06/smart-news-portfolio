import { Router } from "express";
import { sendEmail } from "../services/notificationService.js";
import {
  addSubscription,
  removeSubscription,
} from "../services/subscriptionService.js";

const router = Router();

/**
 * @route POST /api/notifications/subscribe
 * @description Adds or updates a user's email subscription preferences.
 * @access Public
 * @body {string} email - The user's email address.
 * @body {string} frequency - 'daily', 'weekly', or 'off'.
 * @body {object} notificationTypes - { generalSummary: boolean, portfolioAlerts: boolean }.
 * @body {string[]} portfolioSymbols - Array of stock symbols for personalized alerts.
 */

router.post("/subscribe", async (req, res) => {
  const { email, frequency, notificationTypes, portfolioSymbols } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  if (!["daily", "weekly", "off"].includes(frequency)) {
    return res.status(400).json({
      message: 'Invalid frequency. Must be "daily", "weekly", or "off".',
    });
  }
  if (
    !notificationTypes ||
    typeof notificationTypes !== "object" ||
    typeof notificationTypes.generalSummary === "undefined" ||
    typeof notificationTypes.portfolioAlerts === "undefined"
  ) {
    return res.status(400).json({
      message:
        "Notification types (generalSummary, portfolioAlerts) are required and must be booleans.",
    });
  }
  // Validate portfolioSymbols only if portfolio alerts are requested
  if (
    notificationTypes.portfolioAlerts &&
    (!Array.isArray(portfolioSymbols) || portfolioSymbols.length === 0)
  ) {
    return res.status(400).json({
      message:
        "Portfolio symbols are required for personalized portfolio alerts.",
    });
  }

  try {
    const subscription = await addSubscription({
      email,
      frequency,
      notificationTypes,
      portfolioSymbols: portfolioSymbols || [], // Ensure it's an array
      status: "active",
    });

    // Optional: Send an immediate confirmation email upon successful subscription
    const confirmationSubject = "Welcome to Smart News Portfolio Alerts!";
    const confirmationHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Thank You for Subscribing!</h2>
                <p>You have successfully subscribed to Smart News Portfolio alerts with the email: <strong>${email}</strong>.</p>
                <p>Based on your preferences, you will receive your market digest and personalized alerts ${
                  frequency === "daily" ? "daily" : "weekly"
                } at 8:00 AM IST.</p>
                <p>We're excited to help you stay informed!</p>
                <p>Best regards,<br/>The Smart News Portfolio Team</p>
                <p style="font-size: 12px; color: #888; margin-top: 20px;">
                    If you did not subscribe to this service, please ignore this email or contact support.
                </p>
            </div>
        `;
    await sendEmail(email, confirmationSubject, confirmationHtml);

    res.status(200).json({
      message:
        "Subscription preferences saved successfully! A confirmation email has been sent.",
      subscription: subscription,
    });
  } catch (error) {
    console.error("Error saving subscription:", error);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({
        message:
          "This email is already subscribed. Preferences have been updated.",
      });
    }
    res.status(500).json({
      message: "Failed to save subscription preferences. Please try again.",
      error: error.message,
    });
  }
});

/**
 * @route POST /api/notifications/unsubscribe
 * @description Removes a user's email subscription.
 * @access Public
 * @body {string} email - The email address to unsubscribe.
 */
router.post("/unsubscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required to unsubscribe." });
  }
  try {
    const removed = await removeSubscription(email);
    if (removed) {
      res.status(200).json({ message: "Successfully unsubscribed." });
    } else {
      res.status(404).json({ message: "Email not found in subscriptions." });
    }
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res
      .status(500)
      .json({ message: "Failed to unsubscribe.", error: error.message });
  }
});

/**
 * @route POST /api/notifications/send-test-email
 * @description Sends a test email to a specified recipient.
 * @access Public (for testing, would be protected in production)
 * @body {string} recipientEmail - The email address to send the test email to.
 */

router.post("/send-test-email", async (req, res) => {
  const { recipientEmail } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ message: "Recipient email is required." });
  }

  const subject = "Smart News Portfolio: Test Notification";
  const textContent = `Hello,\n\nThis is a test email from your Smart News Portfolio application. If you received this, the notification system is working!\n\nBest regards,\nYour Portfolio Team`;
  const htmlContent = `
        <p>Hello,</p>
        <p>This is a test email from your <strong>Smart News Portfolio</strong> application. If you received this, the notification system is working!</p>
        <p>Best regards,<br>Your Portfolio Team</p>
    `;

  try {
    await sendEmail(recipientEmail, subject, textContent, htmlContent);
    res.status(200).json({ message: "Test email sent successfully!" });
  } catch (error) {
    console.error("Failed to send test email:", error);
    res
      .status(500)
      .json({ message: "Failed to send test email.", error: error.message });
  }
});

export default router;
