const tryCatchMiddleware = require("../middlewares/tryCatch");
const User = require("../models/schema/user");
const { coloredLog } = require("../utils/coloredLog");
const { ErrorHandler } = require("../utils/errorHandler");
const responseSend = require("../utils/responseSend");

const { tokenCheck } = require("../utils/oAuthFunctions");

let handleUsers = tryCatchMiddleware(async (req, res, next) => {
  let tokenStatus = await tokenCheck(req, res);

  if (tokenStatus) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data = await User.find({})
      .skip(startIndex)
      .limit(limit)
      .select({ _id: 1 })
      // .select({ email: 1, phoneNumber: 1, _id: 0 })
      // .select(["email", "phoneNumber"])
      .lean();

    const count = await User.countDocuments({});
    const totalPages = Math.ceil(count / limit);
    const prevPage = page - 1 < 1 ? 1 : page - 1;

    responseSend(res, {
      data: data,
      totalPages: totalPages,
      prevPage: prevPage,
    });
  } else {
    throw new ErrorHandler("Access denied!", 401);
  }
});

let singleUser = tryCatchMiddleware(async (req, res, next) => {
  let tokenStatus = await tokenCheck(req, res);

  if (tokenStatus) {
    const { id } = req.body;

    let userdetails = await User.findById(id).select({
      _id: 0,
      password: 0,
      createdAt: 0,
      __v: 0,
    });

    responseSend(res, userdetails);
  } else {
    throw new ErrorHandler("Access denied!", 401);
  }
});

module.exports = {
  handleUsers,
  singleUser,
};
