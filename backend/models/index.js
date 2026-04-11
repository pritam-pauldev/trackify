const Users = require("../models/users");
const Expenses = require("../models/expense");
const Orders = require("../models/order");

// one to many
Users.hasMany(Expenses);
Expenses.belongsTo(Users);

//one to one
Users.hasMany(Orders)
Orders.belongsTo(Users);

module.exports = {
  Users,
  Expenses,
  Orders
};
