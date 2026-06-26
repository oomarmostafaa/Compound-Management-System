const prisma = require('../config/db');
const { verifyAccessToken } = require('../utils/token');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided.'
      });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Fetch user with their profile 
    const include = {};
    if (decoded.role === 'RESIDENT') include.resident = true;
    if (decoded.role === 'STAFF') include.staff = true;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user token no longer exists.'
      });
    }

    // 4. Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      residentId: user.resident?.id || null,
      staffId: user.staff?.id || null
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token.'
      });
    }
    next(error);
  }
};

module.exports = authMiddleware;
