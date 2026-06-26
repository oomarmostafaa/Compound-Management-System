const express = require('express');
const documentsController = require('./documents.controller');
const authMiddleware = require('../../middlewares/auth');
const { restrictTo } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');
const { uploadDocumentSchema } = require('./documents.validation');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  // Residents upload documents
  .post(
    restrictTo('RESIDENT'),
    upload.single('file'),
    validate(uploadDocumentSchema),
    documentsController.upload
  )
  // Admin views all documents, Residents view their own
  .get(
    restrictTo('ADMIN', 'RESIDENT'),
    documentsController.getAll
  );

router.route('/:id')
  // Residents delete their own documents
  .delete(
    restrictTo('RESIDENT'),
    documentsController.delete
  );

module.exports = router;
