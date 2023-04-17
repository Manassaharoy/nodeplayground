const {
  homeGetHandler,
  homePostHandler,
} = require("../controllers/homeRouterController");

const router = require("express").Router();

router.route("/").get(homeGetHandler).post(homePostHandler);

module.exports = router;
