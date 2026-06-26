const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// دالة داخلية مشتركة لإرسال أي إيميل
async function sendEmail(to, subject, html) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM ,
    to,
    subject,
    html
  });
  console.log(`Email sent: ${info.messageId}`);
}

// إيميل تفعيل الحساب
async function sendActivationEmail(email, token) {
  const url = `http://localhost:${process.env.PORT || 5000}/api/auth/activate?token=${token}`;
  await sendEmail(email, 'Activate Your Account', `
    <h2>Welcome!</h2>
    <p>Click below to activate your account:</p>
    <a href="${url}" style="background:#007bff;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block">Activate Account</a>
    <p style="margin-top:20px;font-size:12px;color:#666">Or copy: ${url}</p>
  `);
}

// إيميل ترحيبي بعد التفعيل
async function sendWelcomeEmail(email) {
  await sendEmail(email, 'Welcome to Compound Management', `
    <h2>Welcome to our Community!</h2>
    <p>Your account is activated. You can now log in and use the system.</p>
  `);
}

// إيميل إعادة تعيين كلمة المرور
async function sendResetPasswordEmail(email, token) {
  const url = `http://localhost:${process.env.PORT || 5000}/api/auth/reset-password?token=${token}`;
  await sendEmail(email, 'Reset Your Password', `
    <h2>Reset Password</h2>
    <p>Click below to reset your password (valid for 1 hour):</p>
    <a href="${url}" style="background:#dc3545;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block">Reset Password</a>
    <p style="margin-top:20px;font-size:12px;color:#666">Or copy: ${url}</p>
  `);
}

module.exports = { sendActivationEmail, sendWelcomeEmail, sendResetPasswordEmail };