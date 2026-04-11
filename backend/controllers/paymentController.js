// const { verifyOrder } = require("../services/cashfreeServices");
// const Order = require("../models/order");

// // app.get("/payment-success",
// const paymentSuccess = async (req, res) => {
//   const { order_id } = req.query;

//   try {
//     const payments = await verifyOrder(order_id);
//     const payment = payments[0]; // first payment attempt

//     const status = payment.payment_status; // "SUCCESS", "FAILED", "PENDING"
//     const paymentId = payment.cf_payment_id;

//     await Order.update(
//       { orderStatus: status, paymentId: paymentId },
//       { where: { orderId: order_id } },
//     );

//     if (status === "SUCCESS") {
//       res.send(`<h2>✅ Payment Successful</h2><p>Payment ID: ${paymentId}</p>`);
//     } else {
//       res.send(`<h2>❌ Payment ${status}</h2>`);
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("<h2>Something went wrong verifying payment</h2>");
//   }
// }

// module.exports = {
//     paymentSuccess
// };

const { verifyOrder } = require("../services/cashfreeServices");
const Order = require("../models/order");

const successPage = (paymentId) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Successful</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #f5f5f0; --surface: #ffffff; --border: #e4e4df;
      --text-primary: #111110; --text-secondary: #6b6b6b; --text-muted: #a3a3a3;
      --accent: #2563eb; --success: #16a34a; --success-light: #f0fdf4;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
      text-align: center;
      animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .icon-wrap {
      width: 64px;
      height: 64px;
      background: var(--success-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      animation: popIn 0.4s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.7); }
      to   { opacity: 1; transform: scale(1); }
    }
    .icon-wrap svg { color: var(--success); }
    h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .detail-row {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .detail-label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .detail-value {
      font-size: 13px;
      color: var(--text-primary);
      font-weight: 600;
      font-family: monospace;
      letter-spacing: 0.02em;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 11px 24px;
      background: var(--accent);
      color: #fff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 7px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.18s;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap">
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </div>
    <h1>Payment successful</h1>
    <p class="subtitle">Your premium plan is now active. Thank you for your payment.</p>
    <div class="detail-row">
      <span class="detail-label">Payment ID</span>
      <span class="detail-value">${paymentId}</span>
    </div>
    <button class="btn" onclick="goToDashboard()">
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
  Go to dashboard
</button>

<script>
function goToDashboard() {
  const token = localStorage.getItem("token");

  console.log("TOKEN ON SUCCESS PAGE:", token);

  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "http://127.0.0.1:5501/signin.html";
    return;
  }

  window.location.href = "http://127.0.0.1:5501/expense.html";
}
</script>
  </div>
</body>
</html>
`;

const failPage = (status) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Failed</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #f5f5f0; --surface: #ffffff; --border: #e4e4df;
      --text-primary: #111110; --text-secondary: #6b6b6b;
      --accent: #2563eb; --error: #dc2626; --error-light: #fef2f2;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
      text-align: center;
      animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .icon-wrap {
      width: 64px;
      height: 64px;
      background: var(--error-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      animation: popIn 0.4s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.7); }
      to   { opacity: 1; transform: scale(1); }
    }
    .icon-wrap svg { color: var(--error); }
    h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .status-badge {
      display: inline-block;
      background: var(--error-light);
      border: 1px solid #fecaca;
      color: var(--error);
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 99px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 11px 24px;
      background: var(--accent);
      color: #fff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 7px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.18s;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap">
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </div>
    <h1>Payment ${status.toLowerCase()}</h1>
    <p class="subtitle">Your payment could not be completed. Please try again.</p>
    <div class="status-badge">${status}</div>
    <br/>
    <a href="/premium.html" class="btn">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
      </svg>
      Try again
    </a>
  </div>
</body>
</html>
`;

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
      res.send(successPage(paymentId));
    } else {
      res.send(failPage(status));
    }
  } catch (err) {
    console.error("💥 ERROR IN paymentSuccess:");

    // 🔴 FULL ERROR BREAKDOWN
    console.error("MESSAGE:", err.message);
    console.error("STACK:", err.stack);

    if (err.response) {
      console.error("CASHFREE ERROR RESPONSE:", err.response.data);
      console.error("STATUS CODE:", err.response.status);
    }
    res.status(500).send(failPage("FAILED"));
  }
};

module.exports = {
  paymentSuccess,
};
