const express = require("express");
const route = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/expensesController");

route.post("/add", authMiddleware, controller.addExpense);
route.get("/", authMiddleware, controller.getExpense);
route.delete("/:id", authMiddleware, controller.deleteExpense);

module.exports = route;
