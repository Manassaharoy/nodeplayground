//? Initialize express server
const express = require("express");
const app = express();

//? Scoket io
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
    // transports: ['websocket', 'polling'],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  },
  allowEIO3: true,
});
const { instrument } = require("@socket.io/admin-ui");
instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS" // "changeit" encrypted with bcrypt
  },
  mode: "development",
});

// const cors = require("cors");
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
const { coloredLog } = require("./utils/coloredLog.js");

dotenv.config();

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
// app.use(cors({ origin: "*" }));

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
app.use("/", homeRoute);
// app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/devices", deviceRoute);
app.use("/users", usersRoute);

//? middlewares
app.use(errorHandlerMiddleware);

io.on("connection", (socket) => {
  console.log("connection: ", socket.id);

  socket.emit('hello', {'message': 'hello world'});

  socket.on("hello", (data)=>{
    console.log("hello : ", data);
  })
  
  socket.on("return", (data)=>{
    console.log("return : ", data);
    socket.broadcast.emit('hello', {'message': 'hello world'});
  })

  socket.on("disconnect", function (data) {
    console.log("disconnect : ", data);
  });
});

//? Starting socket server
httpServer.listen(process.env.PORT || 5000, () => {
  coloredLog(
    [
      `Server is running on port ${process.env.PORT || 5000} & process id: ${
        process.pid
      }`,
    ],
    3
  );
});
