const Users = require("../models/users");
const Expenses = require("../models/expense");
const Orders = require("../models/order");
const ForgotPassword = require("../models/forgotPassword");

// one to many
Users.hasMany(Expenses);
Expenses.belongsTo(Users);

//one to many
Users.hasMany(Orders, {
  foreignKey: "userId",
});
Orders.belongsTo(Users, {
  foreignKey: "userId",
});

// 
ForgotPassword.belongsTo(Users, { foreignKey: "userId" });
Users.hasMany(ForgotPassword, { foreignKey: "userId" });

module.exports = {
  Users,
  Expenses,
  Orders,
  ForgotPassword,
};
