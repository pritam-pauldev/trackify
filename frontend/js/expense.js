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
  }
}
renderPremiumUI();

// REFRESH BUTTON CLICK =========================================================
refreshBtn.addEventListener("click", loadExpenses);

loadExpenses();
