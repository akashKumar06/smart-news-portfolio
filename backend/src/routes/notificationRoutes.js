import { Router } from "express";
import { sendEmail } from "../services/notificationService.js";

const router = Router();

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
