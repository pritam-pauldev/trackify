const express = require("express");
const route = express.Router();
const controller = require("../controllers/expensesController");

route.post("/add", controller.addExpense);
route.get("/", controller.getExpense);

module.exports = route;
