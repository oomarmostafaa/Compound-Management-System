const express = require('express');
const apartmentsController = require('./apartments.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const {
  createApartmentSchema,
  updateApartmentSchema,
  assignResidentSchema
} = require('./apartments.validation');

const router = express.Router();

// Apply auth and admin restrictions to ALL apartment routes
router.use(authMiddleware);
router.use(restrictTo('ADMIN'));

router.route('/')
  .post(validate(createApartmentSchema), apartmentsController.create)
  .get(apartmentsController.getAll);

router.route('/:id')
  .get(apartmentsController.getOne)
  .put(validate(updateApartmentSchema), apartmentsController.update)
  .delete(apartmentsController.delete);

router.post('/:id/assign', validate(assignResidentSchema), apartmentsController.assignResident);

module.exports = router;
