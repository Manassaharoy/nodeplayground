const isAuthenticated = require("../middlewares/authentication");
const isAllowed = require("../middlewares/roleChecking");
const isValid = require("../middlewares/validationCheck");

const router = require("express").Router();

router.route("/login").post(isAllowed, isValid, (req, res) => {
  res.send("oka");
});

module.exports = router;
