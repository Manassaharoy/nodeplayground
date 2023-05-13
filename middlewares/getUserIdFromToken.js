const tryCatchMiddleware = require("./tryCatch");

// TODO: Checking SQL

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//

let getUserIdFromToken = tryCatchMiddleware(async (req, res, next) => {
  let accessToken = req.headers.authorization.split(" ")[1];

  let userData = await prisma["token"].findFirst({
    where: {
      accessToken: accessToken,
    },
  });

  //   return userData.user;
  res.locals.userIdFromToken = userData.user;
  next();
});

module.exports = getUserIdFromToken;
