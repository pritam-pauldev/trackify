const express = require("express");
const route = express.Router();
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/forgetPasswordController");

route.post("/forgotpassword", forgotPassword);
route.post("/resetpassword/:uuid", resetPassword);

module.exports = route;
