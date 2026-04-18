require("dotenv").config();
const express = require("express");
const sequelize = require("./utils/db_connection");
const usersRoute = require("./routes/usersRoutes");
const expensesRoute = require("./routes/expensesRoutes");
const ordersRoute = require("./routes/ordersRoutes");
const paymentRoute = require("./routes/paymentRoutes");
const passwordRoute = require("./routes/passwordRoutes");
const cors = require("cors");
require("./models");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/payment-success", paymentRoute);
app.use("/user", usersRoute);
app.use("/expense", expensesRoute);
app.use("/order", ordersRoute);
app.use("/password", passwordRoute);

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running in 3000 port");
    });
  })
  .catch((err) => {
    console.log(err);
  });
