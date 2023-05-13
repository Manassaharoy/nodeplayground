const {
  adminLoginHandler,
  adminLogoutHandler,
  adminPofileUpdateHandler,
} = require("../controllers/adminRouteController");
const isAuthenticated = require("../middlewares/authentication");
const getUserIdFromToken = require("../middlewares/getUserIdFromToken");
const isAdmin = require("../middlewares/roleChecking");
const { isValidAdmin } = require("../middlewares/validationCheck");

const router = require("express").Router();

router.route("/login").post(isAdmin, isValidAdmin, adminLoginHandler);
router.route("/logout").post(isAdmin, adminLogoutHandler);

//? Create user manually
router.route("/createuser").post(isAdmin, isAuthenticated, adminLoginHandler);

//? Create admin manually
router.route("/createadmin").post(isAdmin, isAuthenticated, adminLoginHandler);

//? Update admin profile
router
  .route("/updateprofile")
  .patch(
    isAdmin,
    isAuthenticated,
    getUserIdFromToken,
    adminPofileUpdateHandler
  );

module.exports = router;
