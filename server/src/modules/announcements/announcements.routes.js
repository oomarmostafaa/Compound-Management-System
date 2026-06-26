const express = require('express');
const announcementsController = require('./announcements.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const { createAnnouncementSchema, updateAnnouncementSchema } = require('./announcements.validation');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .post(
    restrictTo('ADMIN'),
    validate(createAnnouncementSchema),
    announcementsController.create
  )
  .get(
    restrictTo('ADMIN', 'RESIDENT'),
    announcementsController.getAll
  );

router.route('/:id')
  .get(
    restrictTo('ADMIN', 'RESIDENT'),
    announcementsController.getOne
  )
  .put(
    restrictTo('ADMIN'),
    validate(updateAnnouncementSchema),
    announcementsController.update
  )
  .delete(
    restrictTo('ADMIN'),
    announcementsController.delete
  );

module.exports = router;
