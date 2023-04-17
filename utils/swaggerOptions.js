const swaggerOptions = {
  definition: {
    info: {
      title: "Title",
      version: "1.0.0",
      description:
        "Description",
    },
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerOptions;
