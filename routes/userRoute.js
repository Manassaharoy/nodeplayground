const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  createHouse,
  getAllHouses,
} = require("../controllers/userRouterHandlers");

const router = require("express").Router();

router
  .route("/")
  .get(getAllUsers)
  .post(createUser)
  .patch(updateUser)
  .delete(deleteUser);
router.route("/house").get(getAllHouses).post(createHouse);
module.exports = router;
