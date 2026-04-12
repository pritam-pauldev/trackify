const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  "TEST430329ae80e0f32e41a393d78b923034",
  "TESTaf195616268bd6202eeb3bf8dc458956e7192a85",
);

const createOrder = async (
  orderId,
  order_amount,
  order_currency = "INR",
  customer_id,
  customer_phone,
) => {
  try {
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    const formattedExpiryDate = expiryDate.toISOString();

    const request = {
      order_id: orderId,
      order_amount: order_amount,
      order_currency: order_currency,
      customer_details: {
        customer_id: customer_id,
        customer_phone: customer_phone,
      },
      order_meta: {
        return_url: `http://localhost:3000/payment-success?order_id=${orderId}`,
      },
      order_expiry_time: formattedExpiryDate,
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data.payment_session_id;
  } catch (error) {
    console.log(error.message);
    console.error("Error setting up order request:", error.response.data);
  }
};

const verifyOrder = async (orderId) => {
  const response = await cashfree.PGOrderFetchPayments(orderId);
  return response.data; // array of payments
};

module.exports = { createOrder, verifyOrder };