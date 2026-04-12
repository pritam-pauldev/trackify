// ─────────────────────────────────────────
//  templates.js
//  All HTML template strings.
//  Imported by expense.js
// ─────────────────────────────────────────

// ── Skeleton loading rows ──
export const skeletonTemplate = `
  <div class="skeleton-row"></div>
  <div class="skeleton-row"></div>
  <div class="skeleton-row"></div>
`;

// ── Empty state when no expenses ──
export const emptyExpenseTemplate = `
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

// ── Single expense row ──
export function expenseRowTemplate(
  e,
  i,
  meta,
  cat,
  id,
  formattedAmount,
  formattedDate,
) {
  return `
    <div class="expense-item" style="animation-delay:${i * 0.04}s">
      <div class="expense-icon cat-${cat}">${meta.icon}</div>
      <div class="expense-meta">
        <div class="expense-description">${e.description || "—"}</div>
        <div class="expense-detail">
          ${meta.label}${formattedDate ? " · " + formattedDate : ""}
        </div>
      </div>
      <div class="expense-amount">${formattedAmount}</div>
      <button class="delete-btn" onclick="deleteExpense('${id}')" title="Delete">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  `;
}

// ── Premium member banner ──
export const premiumBannerTemplate = `
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

// ── Upgrade to premium banner ──
export const upgradeBannerTemplate = `
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

// ── Leaderboard card inner HTML ──
export const leaderboardCardTemplate = `
  <div class="card-header">
    <h2 class="card-title">🏆 Monthly Leaderboard</h2>
  </div>
  <div id="leaderboardList"></div>
`;

// ── Single leaderboard row ──
export function leaderboardRowTemplate(entry, i, medal, formattedAmount) {
  return `
    <div class="expense-item" style="animation-delay:${i * 0.04}s">
      <div class="expense-icon cat-other" style="font-size:18px;">
        ${medal || "#" + entry.rank}
      </div>
      <div class="expense-meta">
        <div class="expense-description">${entry.name}</div>
        <div class="expense-detail">Rank #${entry.rank} · This month</div>
      </div>
      <div class="expense-amount">${formattedAmount}</div>
    </div>
  `;
}

// ── Empty leaderboard ──
export const emptyLeaderboardTemplate = `
  <div class="empty-state">
    <p class="empty-title">No data yet</p>
    <p class="empty-sub">No expenses recorded this month.</p>
  </div>
`;
