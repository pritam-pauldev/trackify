const Expense = require("../models/expense");
const User = require("../models/users");
const { Op, fn, col, literal } = require("sequelize");

const addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.user.userId;
    if (!userId) {
      return res.status(404).send("User not found");
    }
    const expense = await Expense.create({
      amount: amount,
      description: description,
      category: category,
      UserId: userId,
    });
    console.log("expense is added");
    res.status(202).send("expense is added");
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

const getExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenses = await Expense.findAll({
      where: {
        UserId: userId,
      },
    });
    console.log("expenses fetched");
    res.status(200).json(expenses);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    await Expense.destroy({
      where: {
        id: expenseId,
      },
    });
    console.log("expense is deleted");
    res.status(200).send("expense deleted");
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

// monthly leaderboard ──
const getLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const leaderboard = await Expense.findAll({
      attributes: ["UserId", [fn("SUM", col("amount")), "totalSpent"]],
      where: {
        createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
      },
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      group: ["UserId", "User.id"],
      order: [[literal("totalSpent"), "DESC"]],
    });

    const result = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.User?.name || "Unknown",
      totalSpent: parseFloat(entry.dataValues.totalSpent || 0),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = {
  addExpense,
  getExpense,
  deleteExpense,
  getLeaderboard,
};