const router = require("express").Router();

const isAuthenticated = require("../middlewares/authentication");
const { uploadSingle } = require("../handlers/imageUploadHandler");

const {
  handleProfileView,
  handleProfileChanges,
  handlePhotoUpload,
  handlePhotoRemove,
  handlePasswordChange,
} = require("../controllers/profileRouterController");

router
  .route("/profile")
  .get(isAuthenticated, handleProfileView)
  .post(isAuthenticated, handleProfileChanges)
  .delete(isAuthenticated);

router
  .route("/profile/updatepassword")
  .patch(isAuthenticated, handlePasswordChange);

router
  .route("/profile/uploadpicture")
  .post(isAuthenticated, uploadSingle, handlePhotoUpload)
  .delete(isAuthenticated, handlePhotoRemove);

module.exports = router;
