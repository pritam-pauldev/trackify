const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("trackify", "root", "PRIyaNPRIya", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = sequelize;
