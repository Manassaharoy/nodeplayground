class ErrorHandler extends Error {
  constructor(message, code) {
    super(message);

    this.code = code;
  }
}

module.exports = { ErrorHandler };
