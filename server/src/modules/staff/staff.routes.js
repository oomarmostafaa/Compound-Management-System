const express = require('express');
const staffController = require('./staff.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo, restrictToAdminOrSelf } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const { createStaffSchema, updateStaffSchema } = require('./staff.validation');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .post(restrictTo('ADMIN'), validate(createStaffSchema), staffController.create)
  .get(restrictTo('ADMIN'), staffController.getAll);

router.route('/:id')
  .get(restrictToAdminOrSelf('id', 'staffId'), staffController.getOne)
  .put(restrictTo('ADMIN'), validate(updateStaffSchema), staffController.update)
  .delete(restrictTo('ADMIN'), staffController.delete);

module.exports = router;
