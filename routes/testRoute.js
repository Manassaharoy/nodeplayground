const { handleTestGet, handleTestPost } = require("../controllers/testRouterController");

const router = require("express").Router();

router.route("/").get(handleTestGet).post(handleTestPost);

module.exports = router;
