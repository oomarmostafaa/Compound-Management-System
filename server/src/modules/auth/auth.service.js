const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateAccessToken } = require('../../utils/token');
const { sendResetPasswordEmail } = require('../../utils/email');
const AppError = require('../../utils/AppError');

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        resident: true,
        staff: true
      }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user);

    return {
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        residentId: user.resident?.id || null,
        staffId: user.staff?.id || null
      },
      accessToken
    };
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires }
    });

    try {
      await sendResetPasswordEmail(user.email, resetToken);
    } catch (emailError) {
      throw new AppError('Could not send reset password email', 500);
    }

    return { message: 'Password reset link has been sent to your email.' };
  }

  async resetPassword(token, password) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    return { message: 'Password reset successful' };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Incorrect old password', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();