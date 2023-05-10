const router = require("express").Router();
const {
  handleTestGet,
  handleTestPost,
  handleTestImageUpload,
} = require("../controllers/testRouterController");
const isAuthenticated = require("../middlewares/authentication");
const { uploadSingle } = require("../handlers/imageUploadHandler");

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const {
  handleProfileView,
  handleProfileChanges,
  handlePhotoUpload,
  handlePhotoRemove,
  handlePasswordChange,
} = require("../controllers/profileRouterController");
const prisma = new PrismaClient();

router
  .route("/profile")
  .get(isAuthenticated, handleProfileView)
  .post(isAuthenticated, handleProfileChanges)
  .delete(isAuthenticated);

router.route("/profile/updatepassword").patch(isAuthenticated, handlePasswordChange);

router
  .route("/profile/uploadpicture")
  .post(isAuthenticated, uploadSingle, handlePhotoUpload)
  .delete(isAuthenticated, handlePhotoRemove);

module.exports = router;
