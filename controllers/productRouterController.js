const tryCatchMiddleware = require("../middlewares/tryCatch.js");
const product = require("../models/schema/product.js");
const { coloredLog } = require("../utils/coloredLog.js");
const { ErrorHandler } = require("../utils/errorHandler.js");
const responseSend = require("../utils/responseSend.js");
const setSendData = require("../utils/setSendData.js");
// to throw error =>  throw new ErrorHandler(message, statusCode);
// to send response => data object{} and call responseSend(res, data);

const getProduct = tryCatchMiddleware(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;

  coloredLog(["query --- ", req.query.page], 6);

  let products = await product
    .find()
    .skip(startIndex)
    .limit(limit)
    .select([
      "productID",
      "productName",
      "price",
      "quantity",
      "description",
      "thumbnail",
      "productImages",
      "oldPrice",
    ])
    .lean();

  const count = await product.countDocuments({});
  const totalPages = Math.ceil(count / limit);
  const prevPage = page - 1 < 1 ? 1 : page - 1;

  let data = {
    products: products,
    currentPage: page,
    previousPage: prevPage,
    totalPages: totalPages,
  };

  responseSend(res, data);
});

const createProduct = tryCatchMiddleware(async (req, res, next) => {
  const productDatas = JSON.parse(req.body).products;
  let isError = false;

  const products = await Promise.all(
    productDatas.map(async (productData) => {
      const query = { productID: productData.productID };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      try {
        const checkProducts = await product.findOneAndUpdate(
          query,
          productData,
          options
        );
        return checkProducts;
      } catch (e) {
        throw new ErrorHandler(e.message, 500);
      }
    })
  );

  if (!isError) {
    responseSend(res, products);
  }
});

const updateOneProduct = tryCatchMiddleware(async (req, res, next) => {
  let productID = req.query.productID;
  const update = req.body;

  coloredLog(["product id", productID], 6);

  await pro;
});

const deleteOneProduct = tryCatchMiddleware(async (req, res, next) => {
  res.locals.sendData = {
    data: "deleteOneProduct",
  };
  next();
});

module.exports = {
  getProduct,
  updateOneProduct,
  deleteOneProduct,
  createProduct,
};
