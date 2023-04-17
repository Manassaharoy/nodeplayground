const tryCatchMiddleware = (passesdFucntion) => async (req, res, next) => {
  // Promise.resolve(passesdFucntion(req, res, next)).catch(next);
  try {
    await passesdFucntion(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports = tryCatchMiddleware;
