const api = "http://localhost:3000";

const form = document.querySelector("#addExpenseForm");
const submitBtn = document.querySelector("#submitAddExpenseBtn");
const formMsg = document.querySelector("#formMessage");
const listMsg = document.querySelector("#listMessage");
const expenseList = document.querySelector("#expenseList");
const refreshBtn = document.querySelector("#refreshBtn");

const categoryMeta = {
  food: { icon: "🍔", label: "Food & Drinks" },
  transport: { icon: "🚌", label: "Transport" },
  petrol: { icon: "⛽", label: "Petrol" },
  shopping: { icon: "🛍️", label: "Shopping" },
  utilities: { icon: "💡", label: "Utilities" },
  salary: { icon: "💼", label: "Salary" },
  health: { icon: "🏥", label: "Health" },
  entertainment: { icon: "🎬", label: "Entertainment" },
  other: { icon: "📦", label: "Other" },
};

const svgIcons = {
  error: `<svg class="msg-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>`,
  success: `<svg class="msg-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`,
};

// Prevent Back Button ============
function disableBackButton() {
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = function () {
    window.history.pushState(null, "", window.location.href);
  };
}
disableBackButton();
// Logout token remove ============
document.querySelector("#logOutBtn").addEventListener("click", (event) => {
  localStorage.setItem("token", "");
});

// HELPER FUNCTION =================================================================
function showMsg(box, type, text) {
  box.className = `form-message ${type} visible`;
  box.innerHTML = `${svgIcons[type]}<span>${text}</span>`;
}

function hideMsg(box) {
  box.className = "form-message";
}

function setLoading(on) {
  submitBtn.classList.toggle("loading", on);
  submitBtn.disabled = on;
}

function formatCurrency(n) {
  return (
    "₹" +
    parseFloat(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isPremiumUser() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const user = parseJwt(token);
  return user?.isPremium;
}

// =============    start    =>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>

// ── PREMIUM ANALYTICS ────────────────────────────────────────────────────────

document.addEventListener("click", async (e) => {
  if (!e.target.closest("#downloadReportBtn")) return;

  const { jsPDF } = window.jspdf;
  const element = document.getElementById("analyticsCard");

  // ── hide emojis before capture ──
  const emojiSpans = element.querySelectorAll(".expense-icon");
  emojiSpans.forEach((el) => (el.style.visibility = "hidden"));

  // ── expand full height ──
  const prevOverflow = element.style.overflow;
  element.style.overflow = "visible";
  const tableWrap = element.querySelector(".analytics-table-wrap");
  const prevTableOverflow = tableWrap ? tableWrap.style.overflow : "";
  if (tableWrap) tableWrap.style.overflow = "visible";

  await new Promise((r) => setTimeout(r, 200));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    width: element.offsetWidth,
    height: element.scrollHeight,
    ignoreElements: (el) =>
      el.classList.contains("expense-icon") || el.tagName === "BUTTON",
  });

  // ── restore ──
  emojiSpans.forEach((el) => (el.style.visibility = "visible"));
  element.style.overflow = prevOverflow;
  if (tableWrap) tableWrap.style.overflow = prevTableOverflow;

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  const ratio = contentWidth / canvas.width;
  const totalHeightMM = canvas.height * ratio;
  const pageContentH = pageHeight - margin * 2;
  const totalPages = Math.ceil(totalHeightMM / pageContentH);

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();

    const srcY = (i * pageContentH) / ratio;
    const srcH = Math.min(pageContentH / ratio, canvas.height - srcY);
    const drawH = srcH * ratio;

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.ceil(srcH);
    const ctx = slice.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      srcY,
      canvas.width,
      srcH,
      0,
      0,
      canvas.width,
      srcH,
    );

    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      margin,
      margin,
      contentWidth,
      drawH,
    );
  }

  pdf.save("financial-report.pdf");
});

// Inject the analytics card after leaderboard card (called inside renderPremiumUI if premium)
function injectAnalyticsCard() {
  if (document.getElementById("analyticsCard")) return; // already injected

  const analyticsCard = document.createElement("section");
  analyticsCard.id = "analyticsCard";
  analyticsCard.className = "card";
  analyticsCard.innerHTML = `
    <div class="card-header">
      <h2 class="card-title">📊 Financial Report</h2>
      <div class="analytics-filter" id="analyticsFilter">
        <button class="filter-btn active" data-range="monthly">Monthly</button>
        <button class="filter-btn" data-range="weekly">Weekly</button>
        <button class="filter-btn" data-range="daily">Daily</button>
      </div>
        <button class="download-btn" id="downloadReportBtn">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </button>
      </div>
    <div id="analyticsContent">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;

  // inject after leaderboard card if present, else after expense list card
  const anchor =
    document.getElementById("leaderboardCard") ||
    document.querySelectorAll(".card")[1];
  anchor.insertAdjacentElement("afterend", analyticsCard);

  // filter button events
  document.getElementById("analyticsFilter").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderAnalytics(btn.dataset.range);
  });
}

// Main renderer
function renderAnalytics(range = "monthly") {
  const token = localStorage.getItem("token");
  const user = parseJwt(token);
  console.log("USER:", user);
  if (!user?.isPremium) return;

  const container = document.getElementById("analyticsContent");
  if (!container) return;

  // Grab expenses already in the DOM / re-fetch via axios
  const token2 = localStorage.getItem("token");
  axios
    .get(`${api}/expense/report`, {
      headers: { Authorization: `Bearer ${token2}` },
    })
    .then((res) => {
      const raw = res.data?.expenses || res.data || [];

      // ── Build rows filtered by range ──────────────────────────────────────
      const now = new Date();
      const filtered = raw.filter((e) => {
        const d = new Date(e.createdAt || e.date || 0);
        if (range === "daily") {
          return d.toDateString() === now.toDateString();
        } else if (range === "weekly") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 6);
          return d >= weekAgo && d <= now;
        } else {
          // monthly
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        }
      });

      // ── Build yearly totals ───────────────────────────────────────────────
      const yearlyData = raw.filter((e) => {
        const d = new Date(e.createdAt || e.date || 0);
        return d.getFullYear() === now.getFullYear();
      });
      console.log("FILTERED LENGTH:", filtered.length);
      console.log("YEARLY LENGTH:", yearlyData.length);
      renderAnalyticsTable(container, filtered, yearlyData, range);
    })
    .catch(() => {
      container.innerHTML = `<p style="font-size:13px;color:#dc2626;padding:10px 0">Failed to load analytics.</p>`;
    });
}

function renderAnalyticsTable(container, rows, yearlyRows, range) {
  // ── Per-entry classification: treat "salary" category as income, rest as expense
  // If your backend has an explicit "type" field, swap e.category === "salary" with e.type === "income"
  const now = new Date();
  const isIncome = (e) =>
    (e.type || "").toLowerCase() === "income" ||
    (e.category || "").toLowerCase() === "salary";

  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.createdAt || b.date || 0) -
      new Date(a.createdAt || a.date || 0),
  );

  let totalIncome = 0;
  let totalExpense = 0;

  const rowsHtml = sorted
    .map((e, i) => {
      const income = isIncome(e);
      const amt = parseFloat(e.amount || 0);
      if (income) totalIncome += amt;
      else totalExpense += amt;

      const cat = (e.category || "other").toLowerCase();
      const meta = categoryMeta[cat] || categoryMeta.other;
      const delay = i * 0.03;

      return `
      <tr class="analytics-row" style="animation-delay:${delay}s">
        <td class="col-date">${formatDate(e.createdAt || e.date)}</td>
        <td class="col-desc">
          <span class="expense-icon cat-${cat}" style="width:26px;height:26px;font-size:12px;display:inline-flex;margin-right:8px;vertical-align:middle;">${meta.icon}</span>
          ${e.description || "—"}
        </td>
        <td class="col-cat"><span class="cat-pill cat-${cat}">${meta.label}</span></td>
        <td class="col-income ${income ? "val-income" : "val-empty"}">${income ? formatCurrency(amt) : "—"}</td>
        <td class="col-expense ${!income ? "val-expense" : "val-empty"}">${!income ? formatCurrency(amt) : "—"}</td>
      </tr>`;
    })
    .join("");

  const savings = totalIncome - totalExpense;
  const savingsClass = savings >= 0 ? "val-income" : "val-expense";

  // ── Yearly totals ─────────────────────────────────────────────────────────
  let yIncome = 0,
    yExpense = 0;
  yearlyRows.forEach((e) => {
    const amt = parseFloat(e.amount || 0);
    if (isIncome(e)) yIncome += amt;
    else yExpense += amt;
  });
  const ySavings = yIncome - yExpense;
  const ySavingsClass = ySavings >= 0 ? "val-income" : "val-expense";

  const rangeLabel =
    range === "daily"
      ? "Today"
      : range === "weekly"
        ? "This Week"
        : "This Month";

  container.innerHTML = `
    <!-- Monthly / range table -->
    <div class="analytics-period-label">${rangeLabel}</div>

    ${
      sorted.length === 0
        ? `<div class="empty-state" style="padding:30px 0">
            <p class="empty-title">No transactions in this period</p>
            <p class="empty-sub">Try switching to a wider range.</p>
           </div>`
        : `<div class="analytics-table-wrap">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th class="col-date">Date</th>
                  <th class="col-desc">Description</th>
                  <th class="col-cat">Category</th>
                  <th class="col-income">Income</th>
                  <th class="col-expense">Expense</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
              <tfoot>
                <tr class="analytics-total-row">
                  <td colspan="3" class="total-label">Total</td>
                  <td class="val-income">${formatCurrency(totalIncome)}</td>
                  <td class="val-expense">${formatCurrency(totalExpense)}</td>
                </tr>
                <tr class="analytics-savings-row">
                  <td colspan="3" class="total-label">
                    <span class="savings-badge">Savings</span>
                    <span style="font-size:11px;color:var(--text-muted);font-weight:400"> (Income − Expense)</span>
                  </td>
                  <td colspan="2" class="savings-val ${savingsClass}">${formatCurrency(savings)}</td>
                </tr>
              </tfoot>
            </table>
           </div>`
    }

    <!-- Yearly summary -->
    <div class="analytics-yearly-block">
      <div class="analytics-period-label yearly-label">
        ${now.getFullYear()} — Year at a Glance
      </div>
      <div class="yearly-summary-grid">
        <div class="yearly-tile yearly-income">
          <span class="yearly-tile-label">Total Income</span>
          <span class="yearly-tile-value">${formatCurrency(yIncome)}</span>
        </div>
        <div class="yearly-tile yearly-expense">
          <span class="yearly-tile-label">Total Expense</span>
          <span class="yearly-tile-value">${formatCurrency(yExpense)}</span>
        </div>
        <div class="yearly-tile yearly-savings">
          <span class="yearly-tile-label">Net Savings</span>
          <span class="yearly-tile-value ${ySavingsClass}">${formatCurrency(ySavings)}</span>
        </div>
      </div>
    </div>
  `;
}

// PAGE LOAD (PREMIUM OR NON-PREMIUM UI) ==========================================
function renderPremiumUI() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const user = parseJwt(token);
  if (!user) return;

  const mainContent = document.querySelector(".main-content");
  const secondCard = document.querySelectorAll(".card")[1]; // expense list card

  // ── Premium container (banner) ──
  const premiumContainer = document.createElement("div");
  premiumContainer.id = "premiumContainer";

  if (user.isPremium) {
    premiumContainer.innerHTML = `
      <div class="premium-banner">
        <div class="premium-banner-left">
          <div class="premium-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <p class="premium-title">Premium member</p>
            <p class="premium-sub">You have access to all premium features</p>
          </div>
        </div>
        <button class="leaderboard-btn" id="leaderboardBtn">Show Leaderboard 🏆</button>
      </div>
    `;
  } else {
    premiumContainer.innerHTML = `
      <div class="upgrade-banner">
        <div class="upgrade-left">
          <div class="upgrade-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <p class="upgrade-title">Upgrade to Premium</p>
            <p class="upgrade-sub">Get access to leaderboards and advanced insights</p>
          </div>
        </div>
        <a href="/premium.html" class="upgrade-btn">Upgrade</a>
      </div>
    `;
  }

  // inject before the expense list card
  mainContent.insertBefore(premiumContainer, secondCard);

  // ── Leaderboard card — separate card AFTER expense list card ──
  if (user.isPremium) {
    const leaderboardCard = document.createElement("section");
    leaderboardCard.id = "leaderboardCard";
    leaderboardCard.className = "card";
    leaderboardCard.style.display = "none"; // hidden by default
    leaderboardCard.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">🏆 Monthly Leaderboard</h2>
      </div>
      <div id="leaderboardList"></div>
    `;

    // inject AFTER the expense list card
    secondCard.insertAdjacentElement("afterend", leaderboardCard);

    document
      .getElementById("leaderboardBtn")
      .addEventListener("click", showLeaderboard);
    injectAnalyticsCard();
    renderAnalytics("monthly");
  }
}

// Decode JWT without any library ====
function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const decoded = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

// Fetch and Render Leaderboard ======
async function showLeaderboard() {
  const token = localStorage.getItem("token");
  const leaderboardCard = document.getElementById("leaderboardCard");
  const btn = document.getElementById("leaderboardBtn");
  const leaderboardList = document.getElementById("leaderboardList");

  // toggle off if already visible
  if (leaderboardCard.style.display !== "none") {
    leaderboardCard.style.display = "none";
    btn.textContent = "Show Leaderboard 🏆";
    return;
  }

  leaderboardCard.style.display = "block";
  btn.textContent = "Hide Leaderboard";

  leaderboardList.innerHTML = `
    <div class="skeleton-row"></div>
    <div class="skeleton-row"></div>
    <div class="skeleton-row"></div>
  `;

  try {
    const res = await axios.get(`${api}/expense/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;

    if (!data || data.length === 0) {
      leaderboardList.innerHTML = `
        <div class="empty-state">
          <p class="empty-title">No data yet</p>
          <p class="empty-sub">No expenses recorded this month.</p>
        </div>
      `;
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];

    leaderboardList.innerHTML = data
      .map(
        (entry, i) => `
      <div class="expense-item" style="animation-delay:${i * 0.04}s">
        <div class="expense-icon cat-other" style="font-size:16px;">
          ${medals[i] || "#" + entry.rank}
        </div>
        <div class="expense-meta">
          <div class="expense-description">${entry.name}</div>
          <div class="expense-detail">Rank #${entry.rank} · This month</div>
        </div>
        <div class="expense-amount">${formatCurrency(entry.totalSpent)}</div>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    leaderboardList.innerHTML = `
      <p style="font-size:13px; color:#dc2626; padding: 10px 0;">
        Failed to load leaderboard. Please try again.
      </p>
    `;
  }
}

// LOAD EXPENSES FUNCTIONALITY ====================================================
async function loadExpenses() {
  hideMsg(listMsg);
  renderSkeleton();

  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${api}/expense`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const expenses = res.data?.expenses || res.data || [];
    updateSummary(expenses);
    renderExpenses(expenses);
    // refresh analytics if premium
    if (isPremiumUser()) {
      const activeFilter = document.querySelector(".filter-btn.active");
      const range = activeFilter?.dataset.range || "monthly";
      renderAnalytics(range);
    }
  } catch (err) {
    expenseList.innerHTML = "";
    const serverMsg = err.response?.data?.message || err.response?.data?.error;
    if (!err.response) {
      showMsg(
        listMsg,
        "error",
        "Unable to reach the server. Please check your connection.",
      );
    } else {
      showMsg(
        listMsg,
        "error",
        serverMsg || "Failed to load expenses. Please try again.",
      );
    }
  }
}

// Render Skeleton ==================
function renderSkeleton() {
  expenseList.innerHTML = `
    <div class="skeleton-row"></div>
    <div class="skeleton-row"></div>
    <div class="skeleton-row"></div>
  `;
}

// Total Spent Summmary =============
function updateSummary(expenses) {
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const now = new Date();
  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.createdAt || e.date || "");
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  document.getElementById("totalSpent").textContent = formatCurrency(total);
  document.getElementById("monthSpent").textContent =
    formatCurrency(monthTotal);
  document.getElementById("totalCount").textContent = expenses.length;
}

// Render Expenses ==================
function renderExpenses(expenses) {
  if (!expenses || expenses.length === 0) {
    expenseList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <p class="empty-title">No expenses yet</p>
        <p class="empty-sub">Add your first expense using the form above and it will appear here.</p>
      </div>
    `;
    return;
  }

  const sorted = [...expenses].sort(
    (a, b) =>
      new Date(b.createdAt || b.date || 0) -
      new Date(a.createdAt || a.date || 0),
  );

  expenseList.innerHTML = sorted
    .map((e, i) => {
      const cat = (e.category || "other").toLowerCase();
      const meta = categoryMeta[cat] || categoryMeta.other;
      const id = e.id || e._id;
      return `
      <div class="expense-item" style="animation-delay:${i * 0.04}s">
        <div class="expense-icon cat-${cat}">${meta.icon}</div>
        <div class="expense-meta">
          <div class="expense-description">${e.description || "—"}</div>
          <div class="expense-detail">${meta.label}${e.createdAt || e.date ? " · " + formatDate(e.createdAt || e.date) : ""}</div>
        </div>
        <div class="expense-amount">${formatCurrency(e.amount)}</div>
        <button class="delete-btn" onclick="deleteExpense('${id}', this)" title="Delete">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    `;
    })
    .join("");
}

// FORM SUBMIT ===================================================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMsg(formMsg);

  const amount = parseFloat(document.querySelector("#amount").value);
  const description = document.querySelector("#description").value.trim();
  // const category = document.querySelector("#category").value;

  if (!amount || amount <= 0) {
    showMsg(formMsg, "error", "Please enter a valid amount greater than zero.");
    return;
  }
  // if (!category) {
  //   showMsg(formMsg, "error", "Please select a category for this expense.");
  //   return;
  // }

  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    // await axios.post(
    //   `${api}/expense/add`,
    //   { amount, description, category },
    //   { headers: { Authorization: `Bearer ${token}` } },
    // );
    await axios.post(
      `${api}/expense/add`,
      { amount, description },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    showMsg(formMsg, "success", "Expense added successfully!");
    form.reset();
    await loadExpenses();
    if (isPremiumUser()) {
      await showLeaderboard();
    }
  } catch (err) {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message || err.response?.data?.error;

    if (status === 401) {
      showMsg(
        formMsg,
        "error",
        "Your session has expired. Please sign in again.",
      );
    } else if (status === 400) {
      showMsg(
        formMsg,
        "error",
        serverMsg || "Invalid details. Please check your inputs and try again.",
      );
    } else if (!err.response) {
      showMsg(
        formMsg,
        "error",
        "Unable to reach the server. Please check your connection.",
      );
    } else {
      showMsg(
        formMsg,
        "error",
        serverMsg || "Failed to add expense. Please try again later.",
      );
    }
  } finally {
    setLoading(false);
  }
});

// DELETE EXPENSES ===============================================================
async function deleteExpense(id, btn) {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${api}/expense/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await loadExpenses();
    if (isPremiumUser()) {
      await showLeaderboard();
    }
  } catch (err) {
    const serverMsg = err.response?.data?.message || err.response?.data?.error;
    showMsg(
      listMsg,
      "error",
      serverMsg || "Failed to delete. Please try again.",
    );
  }
}

// RENDER PREMIUM UI =============================================================
renderPremiumUI();

// REFRESH BUTTON CLICK =========================================================
refreshBtn.addEventListener("click", loadExpenses);

loadExpenses();
