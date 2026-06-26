const express = require('express');
const requestsController = require('./requests.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo, canUpdateRequestStatus } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');
const {
  createRequestSchema,
  assignStaffSchema,
  changeStatusSchema
} = require('./requests.validation');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .post(
    restrictTo('RESIDENT'),
    upload.single('image'),
    validate(createRequestSchema),
    requestsController.create
  )
  .get(requestsController.getAll);

router.route('/:id')
  .get(requestsController.getOne);

// Admin-only route to assign staff members to a request
router.post(
  '/:id/assign',
  restrictTo('ADMIN'),
  validate(assignStaffSchema),
  requestsController.assignStaff
);

// Route to update status (Admin, Staff, or Resident)
router.patch(
  '/:id/status',
  canUpdateRequestStatus,  
  validate(changeStatusSchema),
  requestsController.updateStatus
);

module.exports = router;
