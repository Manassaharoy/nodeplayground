const { handleUsers, singleUser } = require("../controllers/usersRouterController");

const router = require("express").Router();

router.route("/").get(handleUsers);
router.route("/userdetails").post(singleUser);

module.exports = router;
