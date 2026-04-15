const express = require("express");
const route = express.Router();
const usersController = require("../controllers/usersControllers");
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

route.post("/signup", usersController.signupCreateUser);
route.post("/signin", usersController.signinUser);
route.get("/premium-status", authMiddleware, paymentController.verifyPremium);


module.exports = route;