const sequelize = require("../utils/db_connection");
const { DataTypes } = require("sequelize");
const Users = require("./users");

const ForgotPassword = sequelize.define("ForgotPassword", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
});



module.exports = ForgotPassword;
