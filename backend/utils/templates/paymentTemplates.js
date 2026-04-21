const successPage = (paymentId, newToken) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Successful</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif; background: #f5f5f0;
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .card {
      background: #fff; border: 1px solid #e4e4df; border-radius: 16px;
      padding: 48px 40px; width: 100%; max-width: 420px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
      text-align: center; animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .icon-wrap {
      width: 64px; height: 64px; background: #f0fdf4; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
      animation: popIn 0.4s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes popIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
    .icon-wrap svg { color: #16a34a; }
    h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.025em; color: #111110; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #6b6b6b; line-height: 1.5; margin-bottom: 28px; }
    .detail-row {
      background: #f5f5f0; border: 1px solid #e4e4df; border-radius: 8px;
      padding: 14px 16px; display: flex; justify-content: space-between; margin-bottom: 24px;
    }
    .detail-label { font-size: 13px; color: #a3a3a3; font-weight: 500; }
    .detail-value { font-size: 13px; color: #111110; font-weight: 600; font-family: monospace; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 11px 24px;
      background: #2563eb; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px; font-weight: 600; border: none; border-radius: 7px;
      cursor: pointer; text-decoration: none; transition: background 0.18s;
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
    <a href="http://127.0.0.1:5501/signin.html" class="btn" id="dashboardBtn">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
      Sign in
    </a>
  </div>

  <script>
    // ✅ Save the new token with isPremium: true BEFORE the user navigates
    // This means no logout/login needed — premium features show immediately
    localStorage.setItem("token", "${newToken}");
  </script>
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
    body {
      font-family: 'Plus Jakarta Sans', sans-serif; background: #f5f5f0;
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .card {
      background: #fff; border: 1px solid #e4e4df; border-radius: 16px;
      padding: 48px 40px; width: 100%; max-width: 420px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
      text-align: center; animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .icon-wrap {
      width: 64px; height: 64px; background: #fef2f2; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
    }
    .icon-wrap svg { color: #dc2626; }
    h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.025em; color: #111110; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #6b6b6b; line-height: 1.5; margin-bottom: 28px; }
    .status-badge {
      display: inline-block; background: #fef2f2; border: 1px solid #fecaca;
      color: #dc2626; font-size: 12px; font-weight: 600; padding: 4px 12px;
      border-radius: 99px; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 24px;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 11px 24px;
      background: #2563eb; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px; font-weight: 600; border: none; border-radius: 7px;
      cursor: pointer; text-decoration: none; transition: background 0.18s;
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
    <div class="status-badge">${status}</div><br/>
    <a href="/premium.html" class="btn">Try again</a>
  </div>
</body>
</html>
`;

module.exports = {
  successPage,
  failPage,
};
