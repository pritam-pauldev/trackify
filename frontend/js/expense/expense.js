// Prevent back button
function disableBackButton() {
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = function () {
    window.history.pushState(null, "", window.location.href);
  };
}
disableBackButton();

// Logout
document.querySelector("#logOutBtn").addEventListener("click", () => {
  localStorage.setItem("token", "");
});

// Refresh button
refreshBtn.addEventListener("click", loadExpenses);

// Init
renderPremiumUI();
loadExpenses();
