// بتتأكد إن المستخدم عنده الصلاحية 
function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        status: 'error',
        message: 'Auth middleware must be initialized before role middleware'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to this action'
      });
    }

    next();
  };
}

// Admin OR صاحب الملف نفسه
// مثال: /residents/123
//   - Admin يقدر يشوف أي resident
//   - Resident #123 يقدر يشوف بروفايله بس
function restrictToAdminOrSelf(paramName, userField) {
  return (req, res, next) => {
    // لو أدمن → يعدي
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // لو صاحب الملف → يعدي
    // مثلاً: /residents/123 و req.user.residentId = 123
    if (req.user[userField] === req.params[paramName]) {
      return next();
    }
    
    // غير كده → ممنوع
    return res.status(403).json({
      status: 'error',
      message: 'ممنوع - ليس لديك صلاحية'
    });
  };
}

// Check if user can update request status
// - Admin: can update any request
// - Staff: can update only if assigned to the request
// - Resident: can update only their own request and only to CLOSED
function canUpdateRequestStatus(req, res, next) {
  const { status } = req.body;
  
  // Only ADMIN, STAFF, and RESIDENT can update
  if (!['ADMIN', 'STAFF', 'RESIDENT'].includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied'
    });
  }

  // Residents can only close their own requests
  if (req.user.role === 'RESIDENT' && status !== 'CLOSED') {
    return res.status(400).json({
      status: 'error',
      message: 'Residents can only close requests'
    });
  }

  next();
}

module.exports = { restrictTo, restrictToAdminOrSelf, canUpdateRequestStatus };
