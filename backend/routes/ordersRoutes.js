const express = require("express");
const route = express.Router();
const controller = require("../controllers/ordersController");
const authMiddleware = require("../middleware/authMiddleware");

route.post("/add-order", authMiddleware, controller.addOrder);

module.exports = route;
