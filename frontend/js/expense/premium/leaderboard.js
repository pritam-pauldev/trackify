async function showLeaderboard() {
  const token = localStorage.getItem("token");
  const leaderboardCard = document.getElementById("leaderboardCard");
  const btn = document.getElementById("leaderboardBtn");
  const leaderboardList = document.getElementById("leaderboardList");

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
    <div class="skeleton-row"></div>`;

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
        </div>`;
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    leaderboardList.innerHTML = data
      .map(
        (entry, i) => `
      <div class="expense-item" style="animation-delay:${i * 0.04}s">
        <div class="expense-icon cat-other" style="font-size:16px;">${medals[i] || "#" + entry.rank}</div>
        <div class="expense-meta">
          <div class="expense-description">${entry.name}</div>
          <div class="expense-detail">Rank #${entry.rank} · This month</div>
        </div>
        <div class="expense-amount">${formatCurrency(entry.totalSpent)}</div>
      </div>`,
      )
      .join("");
  } catch (err) {
    leaderboardList.innerHTML = `
      <p style="font-size:13px;color:#dc2626;padding:10px 0">
        Failed to load leaderboard. Please try again.
      </p>`;
  }
}
