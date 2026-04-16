
const express = require("express");
const route = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const premiumMiddleware = require("../middleware/premiumMiddleware");
const expenseController = require("../controllers/expensesController");
const leaderboardController = require("../controllers/leaderboardController");

route.post("/add", authMiddleware, expenseController.addExpense);
route.get("/", authMiddleware, expenseController.getExpense);
route.delete("/:id", authMiddleware, expenseController.deleteExpense);

// premium only ──
route.get(
  "/leaderboard",
  authMiddleware,
  premiumMiddleware,
  leaderboardController.getLeaderboard
);

module.exports = route;