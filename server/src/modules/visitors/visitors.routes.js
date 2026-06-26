const express = require('express');
const visitorsController = require('./visitors.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const { createVisitorSchema, updateVisitorStatusSchema } = require('./visitors.validation');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  // Residents create visitors
  .post(
    restrictTo('RESIDENT'),
    validate(createVisitorSchema),
    visitorsController.create
  )
  // Admins & Staff view all, Residents view their own
  .get(
    restrictTo('ADMIN', 'STAFF', 'RESIDENT'),
    visitorsController.getAll
  );

router.route('/:id')
  .get(
    restrictTo('ADMIN', 'STAFF', 'RESIDENT'),
    visitorsController.getOne
  );

// Staff/Security & Admin approve or reject visitors
router.patch(
  '/:id/status',
  restrictTo('ADMIN', 'STAFF'),
  validate(updateVisitorStatusSchema),
  visitorsController.updateStatus
);

module.exports = router;
