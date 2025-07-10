import sendEmail from '../lib/sendEmail.js';

export const sendResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank" style="color:#007BFF;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail(email, 'Password Reset Request', message);
};


export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const html = `
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your account:</p>
    <a href="${verifyUrl}" style="color:#007BFF;">Verify Email</a>
    <p>This link will expire in 1 hour.</p>
  `;

  await sendEmail(email, 'Email Verification', html);
};