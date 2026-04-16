const express = require("express");
const route = express.Router();
const controller = require("../controllers/ordersController");
const authMiddleware = require("../middleware/authMiddleware");

route.post("/add-order", authMiddleware, controller.addOrder);
// webhook route (needs raw body)
route.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  controller.webhookHandler
);

module.exports = route;
