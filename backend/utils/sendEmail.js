const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// const sendPasswordResetEmail = async (toEmail, resetLink) => {
//   await transporter.sendMail({
//     from: `"Expense App" <${process.env.BREVO_SMTP_USER}>`,
//     to: toEmail,
//     subject: "Reset your password",
//     html: `
//       <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:10px">
//         <h2 style="margin-bottom:8px">Reset your password</h2>
//         <p style="color:#6b7280">You requested a password reset for your Expense App account.</p>
//         <p style="color:#6b7280">Click the button below. This link expires in <strong>1 hour</strong>.</p>
//         <a href="${resetLink}"
//            style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
//           Reset Password
//         </a>
//         <p style="margin-top:24px;color:#9ca3af;font-size:0.85rem">
//           If you didn't request this, you can safely ignore this email.
//         </p>
//       </div>
//     `,
//   });
// };

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  try {
    const info = await transporter.sendMail({
      from: `"Expense App" <pritampaulsdev@gmail.com>`, // ✅ FIXED
      to: toEmail,
      subject: "Reset your password",
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:10px">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p style="color:#6b7280">You requested a password reset for your Expense App account.</p>
        <p style="color:#6b7280">Click the button below. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetLink}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#9ca3af;font-size:0.85rem">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    });

    console.log("EMAIL SENT:", info);
  } catch (err) {
    console.log("EMAIL ERROR ❌:", err);
  }
};

module.exports = sendPasswordResetEmail;
