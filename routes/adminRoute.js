const {
  adminLoginHandler,
  adminLogoutHandler,
  adminPofileUpdateHandler,
  adminAccountUpdateHandler,
  adminCreateNewUserHandler,
} = require("../controllers/adminRouteController");
const isAuthenticated = require("../middlewares/authentication");
// const getUserIdFromToken = require("../middlewares/getUserIdFromToken");
const {
  isAdminCheckAfterLogin,
  isAdminCheckBeforeLogin,
} = require("../middlewares/roleChecking");
const { isValidAdmin } = require("../middlewares/validationCheck");

const router = require("express").Router();

router
  .route("/login")
  .post(isAdminCheckBeforeLogin, isValidAdmin, adminLoginHandler);

router.route("/logout").post(isAdminCheckAfterLogin, adminLogoutHandler);

//? Update admin profile
router
  .route("/updateaccountinfo")
  .patch(isAdminCheckAfterLogin, isAuthenticated, adminAccountUpdateHandler);
router
  .route("/updateprofile")
  .patch(isAdminCheckAfterLogin, isAuthenticated, adminPofileUpdateHandler);

//? Create user manually
router
  .route("/createuser")
  .post(isAdminCheckAfterLogin, isAuthenticated, adminCreateNewUserHandler);

//? Create admin manually
router
  .route("/createadmin")
  .post(isAdminCheckAfterLogin, isAuthenticated, adminLoginHandler);

module.exports = router;
