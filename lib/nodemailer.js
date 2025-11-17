import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()
console.log("SMTP CONFIG:", process.env.SMTP_HOST, process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      
  port: Number(process.env.SMTP_PORT),      
  secure: true,  // ALWAYS true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Abeg Fix" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
