import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: false,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"SATRACKER" <${ENV.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email gönderildi: %s", info.messageId);
    
    return info;
  } catch (error) {
    console.error("Email gönderme hatasi:", error);

    throw new Error("Email gönderilemedi.");
  }
};