const express = require("express");
const route = express.Router();
const AuthController = require("../app/controllers/auth");

route.post("/login", AuthController.login);
route.post("/register", AuthController.register);
route.get("/logout", AuthController.logout);

module.exports = route;
