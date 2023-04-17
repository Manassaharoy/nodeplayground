const { PrismaClient } = require("@prisma/client");
const { coloredLog } = require("../utils/coloredLog");
const { ErrorHandler } = require("../utils/errorHandler");
const prisma = new PrismaClient();

//? Connect to database
function connectPrisma() {
  try {
    prisma
      .$connect()
      .then(() => {
        coloredLog("Prisma is on", 5);
      })
      .catch((error) => {
        coloredLog(["Prisma Error!!!", error.message], 6);
        // throw new ErrorHandler(error.message, 500);
      });
  } catch (error) {
    coloredLog(["Prisma Error!!!", error.message], 6);
    throw new ErrorHandler(error.message, 500);
  }
}

module.exports = connectPrisma;
