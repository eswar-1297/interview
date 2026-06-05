const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

async function sendThankYouEmail({ name, email }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured — skipping thank-you email");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:36px 40px;">
              <p style="margin:0;color:#9ca3af;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
                Round 2 &nbsp;·&nbsp; Java Technical Assessment
              </p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
                Thank You, ${name}!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                We have successfully received your submission for the
                <strong>Java Technical MCQ Assessment (Round 2)</strong>.
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
                Our team will review your responses and get back to you with the
                next steps shortly. We appreciate the time and effort you put in.
              </p>

              <!-- Info card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">
                      Submission Details
                    </p>
                    <p style="margin:0 0 6px;color:#111827;font-size:14px;">
                      <strong>Name:</strong> ${name}
                    </p>
                    <p style="margin:0 0 6px;color:#111827;font-size:14px;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin:0;color:#111827;font-size:14px;">
                      <strong>Assessment:</strong> Java Technical MCQ &nbsp;·&nbsp; 40 Questions &nbsp;·&nbsp; 30 Minutes
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                If you have any questions, feel free to reach out to your recruiter.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                CloudFuze Inc. &nbsp;·&nbsp; Talent Acquisition Team
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from:    `"CloudFuze Recruitment" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: "Thank You for Completing the Java Technical Assessment — CloudFuze",
    html,
  });

  console.log(`Thank-you email sent to ${email}`);
}

module.exports = { sendThankYouEmail };
