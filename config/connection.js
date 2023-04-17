const mongoose = require("mongoose");

//? MongoDB waring remove
mongoose.set("strictQuery", true);

//? Connect to database
function connectToDatabase(url) {
  mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("Cant connect to db", err));
}

module.exports = connectToDatabase;
