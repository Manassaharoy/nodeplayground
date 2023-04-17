const {
  getAllDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  createMqttTopic,
  getAllMqttTopics,
  getAllMessages,
  getAllMessagesAck,
  createMessages,
  createMessagesAck,
} = require("../controllers/deviceRouterController");

const router = require("express").Router();


router.route("/device").get(getAllDevices).post(createDevice).delete(deleteDevice);
router.route("/mqtt_topic").get(getAllMqttTopics).post(createMqttTopic);
router.route("/messages").get(getAllMessages).post(createMessages);
router.route("/message_ack").get(getAllMessagesAck).post(createMessagesAck);

module.exports = router;
