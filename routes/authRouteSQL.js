const {
  renderSignUpPage,
  renderLoginPage,
  renderHomePage,
  signUpHandler,
  loginHandler,
  accessChekingHandler,
  logoutHandler,
  refreshTokenHanlder,
} = require("../controllers/authRouterControllerSQL");

const router = require("express").Router();

router.route("/").get(renderHomePage);
router.route("/login").get(renderLoginPage).post(loginHandler);
router.route("/signup").get(renderSignUpPage).post(signUpHandler);
router.route("/authcheck").get(accessChekingHandler);
router.route("/logout").post(logoutHandler);
router.route("/refreshtoken").post(refreshTokenHanlder);

module.exports = router;
