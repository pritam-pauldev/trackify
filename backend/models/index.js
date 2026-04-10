const Users = require("../models/users");
const Expenses = require("../models/expense");

// one to many
Users.hasMany(Expenses);
Expenses.belongsTo(Users);

module.exports = {
  Users,
  Expenses,
};
