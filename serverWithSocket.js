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
    password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS", // "changeit" encrypted with bcrypt
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

const Rooms = require("./models/schema/rooms.js");

// function to add a new room
const addRoom = async (roomName, creator) => {
  try {
    const newRoom = new Rooms({
      roomName,
      creator,
      members: [creator],
      message: [],
    });
    await newRoom.save();
    return newRoom;
  } catch (error) {
    console.error(error);
  }
};

// function to add a new room
const joinRoom = async (roomId, username) => {
  try {
    const room = await Rooms.findById(roomId);
    // Check if user is already a member
    if (room.members.includes(username)) {
      throw new Error(`${username} is already a member of this room`);
    }
    room.members.push(username);
    return room.save();
  } catch (error) {
    console.error(error);
  }
};

// function to remove a user from a room
const leaveRoom = async (roomId, username) => {
  try {
    const room = await Rooms.findById(roomId);
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found`);
    }
    if (!room.members.includes(username)) {
      throw new Error(`User ${username} is not a member of room ${roomId}`);
    } else {
      room.members = room.members.filter((member) => member !== username);
      await room.save();
      return room;
    }
  } catch (error) {
    console.error(error);
  }
};

// function to add a new message to a room
const addMessageToRoom = async (roomId, sender, message) => {
  try {
    const room = await Rooms.findById(roomId);
    if (!room) {
      console.log("Room not found");
      return;
    }
    room.message.push({ sender, message });
    await room.save();
    return room;
  } catch (error) {
    console.error(error);
  }
};

let payloadData = (info, data, username, accessToken) => {
  let payload = {
    info: info || "",
    data: data || "",
    username: username || "",
    accessToken: accessToken || "",
  };
  return payload;
};

io.on("connection", (socket) => {
  let username = socket.handshake.query.username;
  let socketID = socket.id;

  coloredLog(["socket connection --- ", username, socketID], 2);

  // message sent when someone connects
  io.emit(
    "activity",
    payloadData(null, `${socket.id} has connected`, username, null)
  );

  // global chat
  socket.on("globalchat", (payload) => {
    socket.broadcast.emit(
      "globalchat",
      payloadData(socket.id, payload.message, payload.username)
    );
  });

  // create room
  socket.on("createRoom", async (payload) => {
    const { roomName, creator } = payload;
    const room = await addRoom(roomName, username);
    if (room) {
      socket.join(room._id);
      socket.emit("roomCreated", payloadData(null, room._id, username, null));
    }
  });

  // join room
  socket.on("joinRoom", (payload) => {
    const { roomId } = payload;
    joinRoom(roomId, username);
    socket.join(roomId);
    io.to(roomId).emit(
      "member",
      payloadData(null, "user joined", username, null)
    );
    addMessageToRoom(roomId, "System", `${username} has joined the room`);
  });

  // send message in room
  socket.on("roomMessage", (payload) => {
    const { roomId, message } = payload;
    addMessageToRoom(roomId, username, message);
    io.to(roomId).emit(
      "roomMessage",
      payloadData(username, message, new Date())
    );
  });

  // leave room
  socket.on("leaveRoom", (payload) => {
    const { roomId } = payload;
    leaveRoom(roomId, username);
    io.to(roomId).emit(
      "member",
      payloadData(null, "user left", username, null)
    );
    addMessageToRoom(roomId, "System", `${username} left the room`);
  });

  // message sent when someone disconnect
  socket.on("disconnect", (payload) => {
    coloredLog(["socket disconnect --- ", username, socketID], 1);
    io.emit(
      "activity",
      payloadData(null, `${socket.id} has left`, username, null)
    );
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
