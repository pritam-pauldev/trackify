const Expense = require("../models/expense");
const User = require("../models/users");

const addExpense = async (req, res) => {
  try {
    const { amount, description, category, email } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const id = user.id;
    console.log(id);
    const expense = await Expense.create({
      amount: amount,
      description: description,
      category: category,
      UserId: id,
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
    const email = req.headers.useremail;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const id = user.id;
    const expenses = await Expense.findAll({
      where: {
        UserId: id,
      },
    });
    console.log("expenses fetched");
    res.status(200).json(expenses);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = {
  addExpense,
  getExpense,
};
