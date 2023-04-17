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
const { obtainToken, tokenCheck } = require("./utils/oAuthFunctions.js");
const responseSend = require("./utils/responseSend.js");
const { ErrorHandler } = require("./utils/errorHandler.js");
const { deleteToken } = require("./config/oAuthModelConf.js");

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
app.post(
  "/login",
  tryCatchMiddleware(async (req, res) => {
    let token = await obtainToken(req, res).then((tokenData) => {
      console.log("tokenData  ---- ", tokenData);
      return tokenData;
    });
    console.log("token  ---- ", token);
    // responseSend(res, token)
    res.send("okay");
  })
);

app.get(
  "/secret",
  tryCatchMiddleware(async (req, res) => {
    let tokenStatus = await tokenCheck(req, res);

    if (tokenStatus) {
      responseSend(res, "Valid");
    } else {
      throw new ErrorHandler("Access denied", 401);
    }
  })
);
app.get(
  "/logout",
  tryCatchMiddleware(async (req, res) => {
    
    let status = await deleteToken(req)
    console.log("status ---", status)
    if (status) {
      responseSend(res, "Valid");
    } else {
      throw new ErrorHandler("Access denied", 500);
    }
  })
);
//!PLAYGROUND

app.use("/devices", deviceRoute);

//? middlewares
app.use(errorHandlerMiddleware);

//? Starting server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
