const express = require("express");
const route = express.Router();
const controller = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// route.get("/", authMiddleware, controller.pa);
route.get("/", controller.paymentSuccess);

module.exports = route;
