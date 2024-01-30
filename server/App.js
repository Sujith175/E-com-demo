const express = require("express");
const cookieParser = require("cookie-parser");
const ErrorHandler = require("./middleware/Error");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: true }));

//routes import
const user = require("./controller/user");
app.use("/api/v2", user);

//for error handling
app.use(ErrorHandler);
module.exports = app;
