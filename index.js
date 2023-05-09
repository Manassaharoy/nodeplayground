//? Initialize express server
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./utils/swaggerOptions.js");

//? Routes import
const homeRoute = require("./routes/homeRoute.js");
const userRoute = require("./routes/userRoute.js");
const deviceRoute = require("./routes/deviceRoute.js");
const authRoute = require("./routes/authRoute.js");
const usersRoute = require("./routes/usersRoute.js");
const productRoute = require("./routes/productRoute.js");
const testRoute = require("./routes/testRoute.js");
const authRouteSQL = require("./routes/authRouteSQL.js");

//? Additional imports
const connectToDatabase = require("./config/connection.js");

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
const { loadExampleData } = require("./config/oAuthModelConf.js");
const { loadExampleDataSQL } = require("./config/oAuthModelConfForSQL");
const { coloredLog } = require("./utils/coloredLog.js");
const responseSend = require("./utils/responseSend.js");
const { ErrorHandler } = require("./utils/errorHandler.js");

dotenv.config();

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors({ origin: "*" }));

//? Additionals
// app.use(
//   bodyParser.urlencoded({
//     limit: "50mb",
//     extended: true,
//     parameterLimit: 50000,
//   })
// );
// app.use(bodyParser.json({ limit: "50mb" }));

//? Database connection
// TODO: uncomment connectToDatabase for mongodb and connectPrisma for prisma
// connectToDatabase(process.env.MONGO_DATABASE_URL);
connectPrisma();

// loadExampleData();
// loadExampleDataSQL(); //for sql database

//? set the view engine to ejs
app.set("view engine", "ejs");

//? Express server monitor
app.use(require("express-status-monitor")());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
//? STATIC FILE SERVE
const path = require('path')

app.use('/images', express.static(path.join(__dirname, 'public/uploads')))

//? middlewares

app.use(loggerMiddleware);
app.use(decryptionMiddleware);

//? API points

app.use("/", homeRoute);
// app.use("/user", userRoute);
// app.use("/auth", authRoute);
app.use("/authsql", authRouteSQL);
// app.use("/devices", deviceRoute);
// app.use("/users", usersRoute);
// app.use("/product", productRoute)
app.use("/test", testRoute);

//? middlewares
app.use(errorHandlerMiddleware);

//? Starting server
app.listen(process.env.PORT || 5000, () => {
  coloredLog(
    [
      "Server is running on port",
      `${process.env.PORT || 5000}`,
      `& single process id: `,
      `${process.pid}`,
    ],
    6
  );
});
