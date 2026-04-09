const express = require("express");
const route = express.Router();
const controller = require("../controllers/usersControllers");

route.post("/signup", controller.signupCreateUser);
route.post("/signin", controller.signinUser);


module.exports = route;