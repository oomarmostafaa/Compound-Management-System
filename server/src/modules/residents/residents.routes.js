const express = require("express");
const residentsController = require("./residents.controller");
const authMiddleware = require("../../middlewares/auth");
const { restrictTo, restrictToAdminOrSelf } = require("../../middlewares/role");
const validate = require("../../middlewares/validate");
const {
  createResidentSchema,
  updateResidentSchema,
} = require("./residents.validation");

const upload = require("../../middlewares/upload");

const router = express.Router();

router.use(authMiddleware);

// Resident uploads own profile image
router.post(
  "/profile-image",
  upload.single("profileImage"),
  residentsController.uploadProfileImage,
);

router
  .route("/")
  .post(
    restrictTo("ADMIN"),
    validate(createResidentSchema),
    residentsController.create,
  )
  .get(restrictTo("ADMIN"), residentsController.getAll);

router.get("/me", restrictTo("RESIDENT"), residentsController.getMe);

router
  .route("/:id")
  .get(restrictToAdminOrSelf("id", "residentId"), residentsController.getOne)
  .put(
    restrictTo("ADMIN"),
    validate(updateResidentSchema),
    residentsController.update,
  )
  .delete(restrictTo("ADMIN"), residentsController.delete);

module.exports = router;