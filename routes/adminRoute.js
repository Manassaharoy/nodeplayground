const router = require("express").Router();
const {
  adminLoginHandler,
  adminLogoutHandler,
  adminPofileUpdateHandler,
  adminAccountUpdateHandler,
  adminCreateNewUserHandler,
  adminListAllUserHandler,
  adminUpdateUserProfileHandler,
  adminProfileViewHandler,
  adminPhotoUploadHandler,
  adminPhotoRemoveHandler,
  adminAllLoggedInUsersHandler,
  adminRemoveSessionForAnUserHandler,
  adminPhotoUploadToSupabaseHandler,
} = require("../controllers/adminRouteController");
const isAuthenticated = require("../middlewares/authentication");
const {
  isAdminCheckAfterLogin,
  isAdminCheckBeforeLogin,
} = require("../middlewares/roleChecking");
const { isValidAdmin } = require("../middlewares/validationCheck");
const { uploadSingle } = require("../handlers/imageUploadHandler");
const {
  uploadSingleSupabase,
} = require("../handlers/imageUploadHandlerSupabase");

router
  .route("/login")
  .post(isAdminCheckBeforeLogin, isValidAdmin, adminLoginHandler);

router.route("/logout").post(isAdminCheckAfterLogin, adminLogoutHandler);

//? Update admin profile
router
  .route("/updateaccountinfo")
  .patch(isAdminCheckAfterLogin, isAuthenticated, adminAccountUpdateHandler);
router
  .route("/profile")
  .get(isAdminCheckAfterLogin, isAuthenticated, adminProfileViewHandler)
  .patch(isAdminCheckAfterLogin, isAuthenticated, adminPofileUpdateHandler);

//TODO: UNCOMMENT BELLOW IF YOU USE SUPABASE STORAGE BUCKET
router
  .route("/profile/uploadpicture")
  .post(
    isAdminCheckAfterLogin,
    isAuthenticated,
    uploadSingleSupabase,
    adminPhotoUploadToSupabaseHandler
  )
  .delete(isAdminCheckAfterLogin, isAuthenticated, adminPhotoRemoveHandler);

//TODO: UNCOMMENT BELLOW IF YOU USE LOCAL FILE SYSTEM STORAGE
// router
//   .route("/profile/uploadpicture")
//   .post(
//     isAdminCheckAfterLogin,
//     isAuthenticated,
//     uploadSingle,
//     adminPhotoUploadHandler
//   )
//   .delete(isAdminCheckAfterLogin, isAuthenticated, adminPhotoRemoveHandler);

//? Create user or admin manually
router
  .route("/useraction")
  .get(isAdminCheckAfterLogin, isAuthenticated, adminListAllUserHandler)
  .post(isAdminCheckAfterLogin, isAuthenticated, adminCreateNewUserHandler)
  .patch(
    isAdminCheckAfterLogin,
    isAuthenticated,
    adminUpdateUserProfileHandler
  );

//? See all loggedin users
router
  .route("/loggedinusers")
  .get(isAdminCheckAfterLogin, isAuthenticated, adminAllLoggedInUsersHandler)
  .post(
    isAdminCheckAfterLogin,
    isAuthenticated,
    adminRemoveSessionForAnUserHandler
  );
module.exports = router;
