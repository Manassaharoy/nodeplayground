const { renderSignUpPage, renderLoginPage, renderHomePage, signUpHandler, loginHandler, accessChekingHandler, logoutHandler } = require("../controllers/authRouterController");

const router = require("express").Router();

router.route("/").get(renderHomePage);
router.route("/login").get(renderLoginPage).post(loginHandler);
router.route("/signup").get(renderSignUpPage).post(signUpHandler);
router.route("/authcheck").get(accessChekingHandler);
router.route("/logout").get(logoutHandler);



module.exports = router;
