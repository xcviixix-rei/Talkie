const messageRoute = require("./message.js");
const conversationRoute = require("./conversation.js");
const callRoute = require("./call.js");
const userRoute = require("./user.js");
const authRoute = require("./auth.js");
const { verifyToken } = require("../app/middlewares/auth.js");

function route(app) {
  app.use("/users", userRoute);
  app.use("/auth", authRoute);
  app.use("/conversations", verifyToken, conversationRoute);
  app.use("/messages", verifyToken, messageRoute);
  app.use("/calls", verifyToken, callRoute);
}

module.exports = route;
