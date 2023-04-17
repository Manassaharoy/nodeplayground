const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const { coloredLog } = require("../utils/coloredLog.js");

//! Prisma
const { PrismaClient } = require("@prisma/client");
const responseSend = require("../utils/responseSend.js");
const prisma = new PrismaClient();
// to throw error =>  return next(new ErrorHandler(message, statusCode));
// to throw error =>  return next(new ErrorHandler(message, statusCode));

const createUser = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);

  let user = await prisma.user.createMany({data: req.body});

  responseSend(res, user)
});

const updateUser = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);
  const { name, id } = req.body;

  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      name: name,
    },
  });

  responseSend(res, user)
});

const deleteUser = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);
  const { id } = req.body;

  let user = await prisma.user.delete({
    where: {
      id: id,
    },
  });

  responseSend(res, user)
});

const getAllUsers = tryCatchMiddleware(async (req, res, next) => {
  let users = await prisma.user.findMany();
  responseSend(res, users)
});

const createHouse = tryCatchMiddleware(async (req, res, next) => {
  coloredLog([JSON.stringify(req.body)], 5);
  
  let house = await prisma.house.createMany({ data: req.body });

  responseSend(res, house)
});

const getAllHouses = tryCatchMiddleware(async (req, res, next) => {
  let houses = await prisma.house.findMany({where:{
    wifiPassword:{
      not:""
    }
  },include:{
    owner: true,
    buildBy:true
  }});
  responseSend(res, houses)
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  createHouse,
  getAllHouses
};
