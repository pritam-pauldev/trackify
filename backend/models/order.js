const sequelize = require("../utils/db_connection");
const { DataTypes } = require("sequelize");

const Orders = sequelize.define("Orders", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  orderId: {
    // Cashfree order_id
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  orderAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "PENDING",
  },
  paymentSessionId: {
    type: DataTypes.STRING,
  },
  paymentId: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Orders;