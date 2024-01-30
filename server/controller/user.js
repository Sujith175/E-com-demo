const express = require("express");
const { upload } = require("../multer");
const router = express.Router();
const User = require("../model/User");
const ErrorHandler = require("../utils/ErrorHandler");
const path = require("path");
const fs = require("fs"); //node-globals
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMaill");

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting File" });
        } else {
          res.json({ message: "File Deleted successfully" });
        }
      });
      return next(new ErrorHandler("user Already Exists", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);
    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl,
    };
    const activationToken = createActionToken(user);

    const activationUrl = `http://localhost:5173/activation/${activationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Activate Your Account",
        message: `Hello ${user.name}, Please click on the link to activate your account: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Please check your mail :- ${user.email} to activate your Account`,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  } catch (error) {
    return next(new ErrorHandler(err.message, 400));
  }
});

//function to create activation token
const createActionToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

module.exports = router;
