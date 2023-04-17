const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const { coloredLog } = require("../utils/coloredLog.js");

//! Prisma
const { PrismaClient } = require("@prisma/client");
const responseSend = require("../utils/responseSend.js");
const prisma = new PrismaClient();
// to throw error =>  return next(new ErrorHandler(message, statusCode));
// to throw error =>  return next(new ErrorHandler(message, statusCode));

//? Devices

const getAllDevices = tryCatchMiddleware(async (req, res, next) => {

  let page = parseInt(req.query.page)<=0 ? 0 : parseInt(req.query.page) - 1 || 0
  let items = parseInt(req.query.items)<=0 && 10 || parseInt(req.query.items)>=100 && 100 || 10

  console.log(req.body);

  //? STATIC
  // let devices = await prisma.device.findMany({
  //   where: {
  //     is_delete: false,
  //     OR: [
  //       { AND: [{ device_id: "Asus" }, { imei: "134654616" }] },
  //       { AND: [{ device_id: "Asus" }, { imei: "4781258428" }] },
  //       { AND: [{ device_id: "Oneplus" }, { imei: "134654616" }] },
  //     ],
  //   },
  // });

  //?Dynamic
  let device_ids = ["Asus", "Asus", "Oneplus"];
  let imeis = ["134654616", "4781258428", "134654616"];

  let whereClause = {
    is_delete:false,
    OR: device_ids.map((deviceId, index) => ({
      AND: [{ device_id: deviceId }, { imei: imeis[index] }],
    })),
  };

  let devices = await prisma.device.findMany({
    where: whereClause,
    // include: { ack_msg: true },
    select: {
      device_id:true,
      imei:true,
      mercent_number:true,
      createdAt:true,
      createdBy:true,
      ack_msg: {
        select: {
          id: false,
          message_id: true,
          device_id: true,
          createdAt: true,
          createdBy: true,
          receiving_time: true,
          is_delete: false,
        },
      },
    },
    skip: page,
    take: items
  });

  responseSend(res, devices);
});

const createDevice = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);

  let device = await prisma.device.create({ data: req.body });

  responseSend(res, device);
});

const updateDevice = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);

  const device = await prisma.device.update({
    where: {
      id: id,
    },
    data: req.body,
  });

  responseSend(res, device);
});

const deleteDevice = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);
  const { id } = req.body;

  let device = await prisma.device.delete({
    where: {
      id: id,
    },
  });

  responseSend(res, device);
});

//? MQTT TOPIC
const getAllMqttTopics = tryCatchMiddleware(async (req, res, next) => {
  let mqtt_topic = await prisma.mqtt_topic.findMany();
  responseSend(res, mqtt_topic);
});

const createMqttTopic = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);

  let mqtt_topic = await prisma.mqtt_topic.create({ data: req.body });

  responseSend(res, mqtt_topic);
});

//? Messages
const getAllMessages = tryCatchMiddleware(async (req, res, next) => {
  let messages = await prisma.messages.findMany();
  responseSend(res, messages);
});

const createMessages = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);

  let messages = await prisma.messages.create({ data: req.body });

  responseSend(res, messages);
});

//? Message ACK
const getAllMessagesAck = tryCatchMiddleware(async (req, res, next) => {
  let message_ack = await prisma.message_ack.findMany();
  responseSend(res, message_ack);
});

const createMessagesAck = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);

  let message_ack = await prisma.message_ack.create({ data: req.body });

  responseSend(res, message_ack);
});

module.exports = {
  getAllDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  getAllMqttTopics,
  createMqttTopic,
  getAllMessages,
  createMessages,
  getAllMessagesAck,
  createMessagesAck,
};
