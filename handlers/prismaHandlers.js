const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const tryCatchMiddleware = require("../middlewares/tryCatch");
const { coloredLog } = require("../utils/coloredLog");

let handlePrismaGetSingleData = async (modelName) => {
  coloredLog(["model name -----", modelName], 1);
  let data = await prisma.client.findMany();

  console.log("data ------- ", data);

  return data;
};

let handlePrismaGetPostData = async (modelName) => {
  let data = await prisma[modelName].createMany({
    data: [
      {
        id: "application",
        clientId: "application",
        clientSecret: "secret",
        grants: ["password", "refresh_token"],
        redirectUris: [],
      },
      {
        clientId: "confidentialApplication",
        clientSecret: "topSecret",
        grants: ["password", "client_credentials"],
        redirectUris: [],
      },
    ],
  });

  console.log("data ------- ", data);

  return data;
};

module.exports = {
  handlePrismaGetSingleData,
  handlePrismaGetPostData,
};
