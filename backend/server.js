require("dotenv").config();
const express = require("express");
const fs = require("fs");
const sequelize = require("./utils/db_connection");
const usersRoute = require("./routes/usersRoutes");
const expensesRoute = require("./routes/expensesRoutes");
const ordersRoute = require("./routes/ordersRoutes");
const paymentRoute = require("./routes/paymentRoutes");
const passwordRoute = require("./routes/passwordRoutes");
// const helmet = require("helmet");
// const compression = require("compression");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
require("./models");
const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);

app.use(cors());
// app.use(helmet());  // secure response header
// app.use(compression());  // compress the assets
app.use(morgan("combined", { stream: accessLogStream })); // need some task - access.log
app.use(express.json());

app.use("/payment-success", paymentRoute);
app.use("/expense", expensesRoute);
app.use("/order", ordersRoute);
app.use("/password", passwordRoute);

app.use("/user", usersRoute);

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server is running in 3000 port");
    });
  })
  .catch((err) => {
    console.log(err);
  });
