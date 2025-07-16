import nodemailer from 'nodemailer';

export default async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "qelvinz@gmail.com",
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: 'qelvinz@gmail.com',
    to,
    subject,
    text,
  });
}