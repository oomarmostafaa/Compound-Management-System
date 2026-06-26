const jwt = require('jsonwebtoken');

// Access Token 
function generateAccessToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      residentId: user.resident?.id || null,
      staffId: user.staff?.id || null
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '7d' }
  );
}

// يتأكد إن Access Token صحيح ومش منتهي
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken
};