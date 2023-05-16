const {
  handleTestGet,
  handleTestPost,
  handleTestImageUpload,
} = require("../controllers/testRouterController");
const isAuthenticated = require("../middlewares/authentication");

const router = require("express").Router();
// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const { uploadSingle } = require("../handlers/imageUploadHandler");
const prisma = new PrismaClient();

router
  .route("/")
  .get( handleTestGet)
  .post( handleTestPost);

router
  .route("/image")
  .post(isAuthenticated, uploadSingle, handleTestImageUpload,);

module.exports = router;
