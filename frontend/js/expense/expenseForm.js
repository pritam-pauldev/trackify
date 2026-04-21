const form = document.querySelector("#addExpenseForm");
const submitBtn = document.querySelector("#submitAddExpenseBtn");
const formMsg = document.querySelector("#formMessage");

function setLoading(on) {
  submitBtn.classList.toggle("loading", on);
  submitBtn.disabled = on;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMsg(formMsg);

  const amount = parseFloat(document.querySelector("#amount").value);
  const description = document.querySelector("#description").value.trim();

  if (!amount || amount <= 0) {
    showMsg(formMsg, "error", "Please enter a valid amount greater than zero.");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${api}/expense/add`,
      { amount, description },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    showMsg(formMsg, "success", "Expense added successfully!");
    form.reset();
    await loadExpenses();
    if (isPremiumUser()) await showLeaderboard();
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
