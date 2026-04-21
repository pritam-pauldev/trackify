const sequelize = require("../utils/db_connection");
const Expense = require("../models/expense");

const getReport = async (req, res) => {
  try {
    const user = req.user.userId;
    console.log("USER ID FROM TOKEN:", user);
    const expense = await Expense.findAll({
      attributes: ["id", "description", "category", "amount", "createdAt"],
      where: {
        UserId: user,
      },
    });
    const data = expense.map((e) => e.dataValues);
    console.log(data);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getReport,
};
