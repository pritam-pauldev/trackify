const express = require("express");
const route = express.Router();
const controller = require("../controllers/usersControllers");
const authMiddleware = require("../middleware/authMiddleware");

route.post("/signup", controller.signupCreateUser);
route.post("/signin", controller.signinUser);
route.get("/premium-status", authMiddleware, controller.verifyPremium);


module.exports = route;