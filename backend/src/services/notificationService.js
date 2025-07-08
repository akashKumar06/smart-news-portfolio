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

/**
 * @function generateGeneralNewsEmailHtml
 * @description Generates the HTML content for the general market news daily digest email.
 * @param {object} sentiment - Object containing overall market sentiment (sentiment, reasoning).
 * @param {Array} articles - Array of general news articles with sentiment analysis.
 * @returns {string} The HTML string for the email body.
 */
export const generateGeneralNewsEmailHtml = (sentiment, articles) => {
  let articlesHtml = articles
    .map(
      (article) => `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <h3 style="font-size: 18px; margin: 0 0 5px; color: #333;">${
              article.title
            }</h3>
            <p style="font-size: 14px; margin: 0 0 5px; color: #555;">${
              article.description
            }</p>
            <p style="font-size: 13px; font-weight: bold; color: ${
              article.sentiment === "Positive"
                ? "#28a745"
                : article.sentiment === "Negative"
                ? "#dc3545"
                : "#ffc107"
            };">Sentiment: ${article.sentiment}</p>
            <a href="${
              article.url
            }" style="font-size: 13px; color: #007bff; text-decoration: none;">Read More</a>
        </div>
    `
    )
    .join("");

  if (articles.length === 0) {
    articlesHtml = "<p>No new general market news to report today.</p>";
  }

  return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #007bff; text-align: center;">Daily Market Digest</h2>
            <p style="font-size: 16px; margin-bottom: 15px;">Here's your daily update on the general market sentiment and top news:</p>
            
            <div style="background-color: ${
              sentiment.sentiment === "Positive"
                ? "#d4edda"
                : sentiment.sentiment === "Negative"
                ? "#f8d7da"
                : "#fff3cd"
            }; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <p style="font-size: 16px; font-weight: bold; color: ${
                  sentiment.sentiment === "Positive"
                    ? "#155724"
                    : sentiment.sentiment === "Negative"
                    ? "#721c24"
                    : "#856404"
                };">Overall Market Sentiment: ${sentiment.sentiment}</p>
                <p style="font-size: 14px; color: #333;">${
                  sentiment.reasoning
                }</p>
            </div>
            
            <h3 style="color: #007bff; margin-top: 30px;">Top General News:</h3>
            ${articlesHtml}

            <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                You are receiving this email because you subscribed to Smart News Portfolio updates.
            </p>
        </div>
    `;
};

/**
 * @function generatePortfolioAlertsEmailHtml
 * @description Generates the HTML content for personalized portfolio news alerts.
 * @param {Array} articles - Array of personalized news articles (each including a 'symbol' property).
 * @param {string} email - The recipient's email address (can be used for unsubscribe links if implemented).
 * @returns {string} The HTML string for the email body.
 */
export const generatePortfolioAlertsEmailHtml = (articles, email) => {
  let articlesHtml = articles
    .map(
      (article) => `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <h3 style="font-size: 18px; margin: 0 0 5px; color: #333;">${
              article.title
            }</h3>
            <p style="font-size: 14px; margin: 0 0 5px; color: #555;"><strong>Symbol: ${article.symbol.toUpperCase()}</strong></p>
            <p style="font-size: 14px; margin: 0 0 5px; color: #555;">${
              article.description
            }</p>
            <p style="font-size: 13px; font-weight: bold; color: ${
              article.sentiment === "Positive"
                ? "#28a745"
                : article.sentiment === "Negative"
                ? "#dc3545"
                : "#ffc107"
            };">Sentiment: ${article.sentiment}</p>
            <a href="${
              article.url
            }" style="font-size: 13px; color: #007bff; text-decoration: none;">Read More</a>
        </div>
    `
    )
    .join("");

  if (articles.length === 0) {
    articlesHtml =
      "<p>No new personalized news to report today for your portfolio.</p>";
  }

  return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #007bff; text-align: center;">Your Personalized Portfolio News</h2>
            <p style="font-size: 16px; margin-bottom: 15px;">Here are the latest news articles impacting your portfolio:</p>
            
            ${articlesHtml}

            <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                You are receiving this email because you subscribed to Smart News Portfolio alerts.
            </p>
        </div>
    `;
};
