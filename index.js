//? Initialize express server
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

//! OAUTH
const OAuth2Server = require("oauth2-server");
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
//!

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./utils/swaggerOptions.js");

//? Routes import
const homeRoute = require("./routes/homeRoute.js");
const userRoute = require("./routes/userRoute.js");
const deviceRoute = require("./routes/deviceRoute.js");

//? Additional imports
const connectToDatabase = require("./config/connection.js");
const { PrismaClient } = require("@prisma/client");

//? Environment veriable initialization
const dotenv = require("dotenv");
const { decryptionMiddleware } = require("./middlewares/encryptAndDecrypt.js");
// const {
//   decryptionMiddleware,
//   encryptionMiddleware,
// } = require("./middlewares/encryptAndDecryptSHA256.js");

const loggerMiddleware = require("./middlewares/loggerMiddleware.js");
const {
  errorHandlerMiddleware,
} = require("./middlewares/errorHandlerMiddleware.js");
const connectPrisma = require("./config/prismaConnection.js");
const { coloredLog } = require("./utils/coloredLog.js");
const { loadExampleData } = require("./auth/model.js");
const User = require("./models/schema/user.js");
const tryCatchMiddleware = require("./middlewares/tryCatch.js");

dotenv.config();

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors({ origin: "*" }));

//? Additionals
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));

//? Database connection
// TODO: uncomment connectToDatabase for mongodb and connectPrisma for prisma
connectToDatabase(process.env.MONGO_DATABASE_URL);
// connectPrisma()

loadExampleData();

//? set the view engine to ejs
app.set("view engine", "ejs");

//? Express server monitor
app.use(require("express-status-monitor")());
app.use(express.json());

//? middlewares

app.use(loggerMiddleware);
app.use(decryptionMiddleware);

//? API points
// app.use("/", homeRoute);
// app.use("/user", userRoute);

//! PLAYGROUND
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.post("/signup", async (req, res) => {
  const { email, phoneNumber, password } = req.body;

  console.log(email, phoneNumber, password);

  try {
    // check if user already exists
    const existingUser = await User.findOne({
      $and: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create a new user instance with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      phoneNumber,
      password: hashedPassword,
    });

    // save the user instance to the database
    await newUser.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  // const { email, phoneNumber, password } = req.body;
  // console.log(
  //   "email, phoneNumber, password ---- ",
  //   email,
  //   phoneNumber,
  //   password
  // );


  let token = await obtainToken(req, res, async (obj) => {
    console.log("object inside login  -------  ", obj);
    return obj;
  });

  console.log("obtainToken ---- ", token);

  res.redirect("secret");
});

app.get("/secret", (req, res) => {
  res.render("secret");
});
//!PLAYGROUND

app.use("/devices", deviceRoute);

//? middlewares
app.use(errorHandlerMiddleware);


app.oauth = new OAuth2Server({
  model: require("./auth/model"),
  // accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME || 3600,
  // allowBearerTokensInQueryString: true,
});

async function obtainToken(req, res, callback) {
  var request = new Request(req);
  var response = new Response(res);

  // return app.oauth
  //   .token(request, response)
  //   .then(function (token) {
  //     callback(token);
  //   })
  //   .catch(function (err) {
  //     console.log("this is inside token catch!", err.message);
  //   });
  let token = await app.oauth.token(request, response).then((token)=>{
    // console.log("TOKEN ------- ", token);
    callback(token);
  }).catch(function (err) {
    console.log("this is inside token catch!", err.message);
  })
  callback(token)
  // console.log("TOKEN ------- ", token);
}

//? Starting server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
