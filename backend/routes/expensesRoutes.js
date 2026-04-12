
const express = require("express");
const route = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const premiumMiddleware = require("../middleware/premiumMiddleware");
const controller = require("../controllers/expensesController");

route.post("/add", authMiddleware, controller.addExpense);
route.get("/", authMiddleware, controller.getExpense);
route.delete("/:id", authMiddleware, controller.deleteExpense);

// premium only ──
route.get(
  "/leaderboard",
  authMiddleware,
  premiumMiddleware,
  controller.getLeaderboard,
);

module.exports = route;