const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const contactus = require("../models/schema/contactus.js");
const product = require("../models/schema/product.js");
const { coloredLog } = require("../utils/coloredLog.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
const responseSend = require("../utils/responseSend.js");
const { sendMail } = require("../utils/sendEmail.js");
const setSendData = require("../utils/setSendData.js");
// to throw error =>  throw new ErrorHandler(message, statusCode);
// to send response => data object{} and call responseSend(res, data);

const emailGetHandler = tryCatchMiddleware(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;

  coloredLog(["query --- ", req.query.page], 6);

  let contacts = await contactus
    .find()
    .skip(startIndex)
    .limit(limit)
    .select(["name", "email", "subject", "message"])
    .lean();

  const count = await contactus.countDocuments({});
  const totalPages = Math.ceil(count / limit);
  const prevPage = page - 1 < 1 ? 1 : page - 1;

  let data = {
    contacts: contacts,
    currentPage: page,
    previousPage: prevPage,
    totalPages: totalPages,
  };

  responseSend(res, data);
});

const emailPostHandler = tryCatchMiddleware(async (req, res, next) => {
  const { name, email, subject, message } = JSON.parse(req.body);

  console.log("-------   ", name, email, subject, message);

  await contactus
    .create({
      name: name,
      email: email,
      subject: subject,
      message: message,
    })
    .then(async (data) => {
      let emailStatus = await sendMail({
        name: name,
        to: email,
        subject: subject,
        message: message,
      });

      responseSend(res, {
        status: "Email has been sent",
      });
    })
    .catch((err) => {
      throw new ErrorHandler(err.message, 400);
    });
});

module.exports = {
  emailGetHandler,
  emailPostHandler,
};
