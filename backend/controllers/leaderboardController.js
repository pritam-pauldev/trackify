const Expense = require("../models/expense");
const User = require("../models/users");
const { Op } = require("sequelize");
const sequelize = require("../utils/db_connection");

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });

    const result = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      totalSpent: user.totalExpense,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getLeaderboard,
};
