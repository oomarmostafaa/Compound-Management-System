const express = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo } = require('../../middlewares/role');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('ADMIN'));

router.get('/stats', dashboardController.getStats);

module.exports = router;
