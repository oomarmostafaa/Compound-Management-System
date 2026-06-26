const express = require('express');
const buildingsController = require('./buildings.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const { createBuildingSchema, updateBuildingSchema } = require('./buildings.validation');

const router = express.Router();

// Apply auth and admin restrictions to ALL building routes
router.use(authMiddleware);
router.use(restrictTo('ADMIN'));

router.route('/')
  .post(validate(createBuildingSchema), buildingsController.create)
  .get(buildingsController.getAll);

router.route('/:id')
  .get(buildingsController.getOne)
  .put(validate(updateBuildingSchema), buildingsController.update)
  .delete(buildingsController.delete);

module.exports = router;
