const router = require("express").Router();

const isAuthenticated = require("../middlewares/authentication");
const { uploadSingle } = require("../handlers/imageUploadHandler");

const {
  handleProfileView,
  handleProfileChanges,
  handlePhotoUpload,
  handlePhotoRemove,
  handlePasswordChange,
  handlePhotoUploadToBucket,
} = require("../controllers/profileRouterController");
const {
  uploadSingleSupabase,
} = require("../handlers/imageUploadHandlerSupabase");

router
  .route("/profile")
  .get(isAuthenticated, handleProfileView)
  .post(isAuthenticated, handleProfileChanges)
  .delete(isAuthenticated);

router
  .route("/profile/updatepassword")
  .patch(isAuthenticated, handlePasswordChange);

//TODO: UNCOMMENT BELLOW IF YOU USE SUPABASE STORAGE BUCKET
router
  .route("/profile/uploadpicture")
  .post(isAuthenticated, uploadSingleSupabase, handlePhotoUploadToBucket)
  .delete(isAuthenticated, handlePhotoRemove);

//TODO: UNCOMMENT BELLOW IF YOU USE LOCAL FILE SYSTEM STORAGE
// router
//   .route("/profile/uploadpicture")
//   .post(isAuthenticated, uploadSingle, handlePhotoUpload)
//   .delete(isAuthenticated, handlePhotoRemove);

module.exports = router;
