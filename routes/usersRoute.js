const { handleUsers, singleUser } = require("../controllers/usersRouterController");

const router = require("express").Router();

router.route("/").get(handleUsers);
router.route("/userdetails").get(singleUser);

module.exports = router;
