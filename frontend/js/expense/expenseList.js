// ── SHARED HELPERS ──────────────────────────────────────────────
const api = "http://localhost:3000";

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

function showMsg(box, type, text) {
  box.className = `form-message ${type} visible`;
  box.innerHTML = `${svgIcons[type]}<span>${text}</span>`;
}

function hideMsg(box) {
  box.className = "form-message";
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

// ── LOAD EXPENSES ───────────────────────────────────────────────
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

function renderSkeleton() {
  expenseList.innerHTML = `
    <div class="skeleton-row"></div>
    <div class="skeleton-row"></div>
    <div class="skeleton-row"></div>
  `;
}

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
      </div>`;
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
      </div>`;
    })
    .join("");
}

async function deleteExpense(id) {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${api}/expense/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadExpenses();
    if (isPremiumUser()) await showLeaderboard();
  } catch (err) {
    const serverMsg = err.response?.data?.message || err.response?.data?.error;
    showMsg(
      listMsg,
      "error",
      serverMsg || "Failed to delete. Please try again.",
    );
  }
}
