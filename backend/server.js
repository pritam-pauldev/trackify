const express = require("express");
const sequelize = require("./utils/db_connection");
const usersRoute = require("./routes/usersRoutes");
const cors = require("cors");
// require("./models");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", usersRoute);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running in 3000 port");
    });
  })
  .catch((err) => {
    console.log(err);
  });
