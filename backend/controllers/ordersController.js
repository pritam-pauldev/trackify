const Order = require("../models/order");
const {createOrder} = require("../services/cashfreeServices");

const addOrder = async (req, res) => {
  try {
      const userId = req.user.userId;
    const { amount, phone } = req.body;

    // Create unique orderId
    const orderId = "order_" + Date.now();

    // Call Cashfree
    const paymentSessionId = await createOrder(
      orderId,
      amount,
      "INR",
      userId.toString(),
      phone,
    );

    const order = await Order.create({
      userId,
      orderId,
      orderAmount: amount,
      orderStatus: "PENDING",
      paymentSessionId,
    });

    res.status(200).json({
      message: "Order created",
      paymentSessionId,
      orderId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const webhookHandler = async (req, res) => {
  const { data } = req.body;
  const orderId = data.order.order_id;
  const paymentId = data.payment.cf_payment_id;
  const status = data.payment.payment_status;

  await Order.update(
    { orderStatus: status, paymentId: paymentId },
    { where: { orderId } },
  );

  res.status(200).json({ success: true });
};

module.exports = { addOrder, webhookHandler };

module.exports = {
    addOrder,
    webhookHandler
};