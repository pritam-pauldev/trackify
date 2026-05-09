const express = require("express");
const route = express.Router();
const usersController = require("../controllers/usersControllers");
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");
const expenseController = require("../controllers/expensesController");

route.post("/signup", usersController.signupCreateUser);
route.post("/signin", usersController.signinUser);
route.get("/premium-status", authMiddleware, paymentController.verifyPremium);
route.get("/download", authMiddleware, expenseController.downloadExpense);

module.exports = route;
