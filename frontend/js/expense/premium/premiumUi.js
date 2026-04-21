function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const decoded = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

function renderPremiumUI() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const user = parseJwt(token);
  if (!user) return;

  const mainContent = document.querySelector(".main-content");
  const secondCard = document.querySelectorAll(".card")[1];

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
      </div>`;
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
      </div>`;
  }

  mainContent.insertBefore(premiumContainer, secondCard);

  if (user.isPremium) {
    const leaderboardCard = document.createElement("section");
    leaderboardCard.id = "leaderboardCard";
    leaderboardCard.className = "card";
    leaderboardCard.style.display = "none";
    leaderboardCard.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">🏆 Monthly Leaderboard</h2>
      </div>
      <div id="leaderboardList"></div>`;

    secondCard.insertAdjacentElement("afterend", leaderboardCard);
    document
      .getElementById("leaderboardBtn")
      .addEventListener("click", showLeaderboard);

    injectAnalyticsCard();
    renderAnalytics("monthly");
  }
}
