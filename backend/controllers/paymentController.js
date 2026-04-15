const { verifyOrder } = require("../services/cashfreeServices");
const {successPage, failPage} = require("../utils/templates/paymentTemplates");
const Order = require("../models/order");
const Users = require("../models/users");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "1q2waSE34rdZXcG457HVnjuY67InKu89PlIFYU64SRTUinvcd4679OJfr";

const paymentSuccess = async (req, res) => {
  const { order_id } = req.query;

  try {
    const payments = await verifyOrder(order_id);
    const payment = payments[0];

    const status = payment.payment_status;
    const paymentId = payment.cf_payment_id;

    await Order.update(
      { orderStatus: status, paymentId: paymentId },
      { where: { orderId: order_id } },
    );

    if (status === "SUCCESS") {
      const order = await Order.findOne({ where: { orderId: order_id } });

      // set isPremium: true in DB
      await Users.update({ isPremium: true }, { where: { id: order.userId } });
      console.log("USER UPGRADED TO PREMIUM");

      // issue a fresh JWT with isPremium: true
      // this token gets saved to localStorage on the success page
      // so user sees premium features immediately without re-login
      const user = await Users.findOne({ where: { id: order.userId } });
      const newToken = jwt.sign(
        { userId: user.id, isPremium: true },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.send(successPage(paymentId, newToken));
    } else {
      res.send(failPage(status));
    }
  } catch (err) {
    console.error("ERROR IN paymentSuccess:", err.message);
    res.status(500).send(failPage("FAILED"));
  }
};

const verifyPremium = async (req, res) => {
  const order = await Orders.findOne({
    where: { userId: req.user.userId, orderStatus: "SUCCESS" },
  });
  res.json({ isPremium: !!order });
};

module.exports = {
  paymentSuccess,
  verifyPremium
};
