const sequelize = require("../utils/db_connection");
const Expense = require("../models/expense");

const getReport = async (req, res) => {
  try {
    const user = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await Expense.findAndCountAll({
      attributes: ["id", "description", "category", "amount", "createdAt"],
      where: { UserId: user },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      expenses: rows.map((e) => e.dataValues),
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getReport,
};
