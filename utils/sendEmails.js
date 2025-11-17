import sendEmail from '../lib/nodemailer.js';

export const sendResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#f4f4f7; padding:30px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px;">
      
      <h2 style="color:#333;">Password Reset Request</h2>

      <p style="font-size:15px; color:#555;">
        You requested to reset your password. Click the button below to proceed:
      </p>

      <a href="${resetUrl}" 
        style="display:inline-block; margin:20px 0; padding:12px 20px; 
        background:#007bff; color:white; text-decoration:none; border-radius:6px;">
        Reset Password
      </a>

      <p style="font-size:14px; color:#888;">
        This link will expire in <strong>1 hour</strong>.
      </p>

      <p style="font-size:14px; color:#888;">
        If you did not request this, you can safely ignore this email.
      </p>

      <hr style="margin-top:40px; border:none; border-top:1px solid #eee;">

      <p style="font-size:12px; color:#aaa; text-align:center;">
        &copy; ${new Date().getFullYear()} Abeg Fix. All Rights Reserved.
      </p>
    </div>
  </div>
  `;

  await sendEmail(email, 'Password Reset Request', html);
};


export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#f4f4f7; padding:30px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px;">
      
      <h2 style="color:#333;">Verify Your Email</h2>

      <p style="font-size:15px; color:#555;">
        Thank you for signing up! Please confirm your email to activate your account.
      </p>

      <a href="${verifyUrl}" 
        style="display:inline-block; margin:20px 0; padding:12px 20px; 
        background:#28a745; color:white; text-decoration:none; border-radius:6px;">
        Verify Email
      </a>

      <p style="font-size:14px; color:#888;">
        This link will expire in <strong>1 hour</strong>.
      </p>

      <p style="font-size:14px; color:#888;">
        If you didn’t create an account, you can safely ignore this email.
      </p>

      <hr style="margin-top:40px; border:none; border-top:1px solid #eee;">

      <p style="font-size:12px; color:#aaa; text-align:center;">
        &copy; ${new Date().getFullYear()} Abeg Fix. All Rights Reserved.
      </p>
    </div>
  </div>
  `;

  await sendEmail(email, 'Email Verification', html);
};
