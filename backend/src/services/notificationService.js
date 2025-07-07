import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using SendGrid.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} textContent - The plain text content of the email.
 * @param {string} htmlContent - The HTML content of the email.
 * @returns {Promise<[Object, Object]>} A promise that resolves with the SendGrid response.
 */
export async function sendEmail(toEmail, subject, textContent, htmlContent) {
  // Check if the SENDER_EMAIL environment variable is set
  if (!process.env.SENDER_EMAIL) {
    console.error(
      "SENDER_EMAIL environment variable is not set. Cannot send email."
    );
    throw new Error("Sender email is not configured.");
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.error(
      "SENDGRID_API_KEY environment variable is not set. Cannot send email."
    );
    throw new Error("SendGrid API Key is not configured.");
  }

  const msg = {
    to: toEmail,
    from: process.env.SENDER_EMAIL,
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    console.log(
      `Attempting to send email to ${toEmail} from ${process.env.SENDER_EMAIL}...`
    );
    const response = await sgMail.send(msg);
    console.log("Email sent successfully:", response[0].statusCode);
    return response;
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response ? error.response.body : error
    );
    throw new Error(
      `Failed to send email: ${
        error.message || (error.response && error.response.body)
      }`
    );
  }
}
