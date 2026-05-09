const Expense = require("../models/expense");
const User = require("../models/users");
const { Op, fn, col, literal } = require("sequelize");
const sequelize = require("../utils/db_connection");
// const ai = require("../services/geminiServices");
const ai = require("../services/aiServices");
const AWS = require("aws-sdk");
require("dotenv").config();

const addExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, description } = req.body;
    const category = await ai(description);
    console.log(category);
    const userId = req.user.userId;
    if (!userId) {
      await t.rollback();
      return res.status(404).send("User not found");
    }

    const selectUser = await User.findOne({
      where: {
        id: userId,
      },
      transaction: t,
    });
    if (!selectUser) {
      await t.rollback();
      return res.status(404).send("User not found");
    }

    const expense = await Expense.create(
      {
        amount: amount,
        description: description,
        category: category,
        UserId: userId,
      },
      { transaction: t },
    );

    selectUser.totalExpense += Number(amount);
    await selectUser.save({ transaction: t });
    await t.commit();
    console.log("expense is added");
    res.status(201).send("expense is added");
  } catch (error) {
    await t.rollback();
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
  const t = await sequelize.transaction();

  try {
    const expenseId = req.params.id;

    // get expense (amount + userId)
    const expense = await Expense.findOne({
      attributes: ["amount", "UserId"],
      where: { id: expenseId },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).send("Expense not found");
    }

    // get user
    const user = await User.findOne({
      where: { id: expense.UserId },
      transaction: t,
    });

    if (!user) {
      await t.rollback();
      return res.status(404).send("User not found");
    }

    // delete expense
    await Expense.destroy({
      where: { id: expenseId },
      transaction: t,
    });

    // update totalExpense
    user.totalExpense = Number(user.totalExpense) - Number(expense.amount);
    console.log(user.totalExpense);
    await user.save({ transaction: t });

    await t.commit();

    console.log("expense is deleted");
    res.status(200).send("expense deleted");
  } catch (error) {
    await t.rollback();
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

function uploadToS3(data, fileName) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  const s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    region: process.env.AWS_REGION,
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: "public-read",
    ContentType: "text/plain",
  };

  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("S3 upload failed:", err);
        reject(err);
      } else {
        console.log("S3 upload success:", s3response);
        resolve(s3response.Location);
      }
    });
  });
}

const downloadExpense = async (req, res) => {
  try {
    const userId = req.user.userId;

    const expenses = await Expense.findAll({
      where: { UserId: userId },
    });

    const strigifiedExpences = JSON.stringify(expenses);
    const fileName = `expenses-${userId}-${Date.now()}.txt`;
    const fileURL = await uploadToS3(strigifiedExpences, fileName);
    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = {
  addExpense,
  getExpense,
  deleteExpense,
  downloadExpense
};
