const express = require("express");
const route = express.Router();
const controller = require("../controllers/usersControllers");

route.post("/signup", controller.signupCreateUser);


module.exports = route;