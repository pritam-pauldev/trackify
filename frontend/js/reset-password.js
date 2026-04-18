const api = "http://localhost:3000";

const form = document.querySelector("#resetForm");
const submitBtn = document.querySelector("#submitResetBtn");
const messageBox = document.querySelector("#formMessage");

function showMessage(type, text) {
  const icons = {
    error: `<svg class="msg-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>`,
    success: `<svg class="msg-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
             </svg>`,
  };
  messageBox.className = `form-message ${type} visible`;
  messageBox.innerHTML = `${icons[type]}<span>${text}</span>`;
}

function hideMessage() {
  messageBox.className = "form-message";
}

function setLoading(loading) {
  submitBtn.classList.toggle("loading", loading);
  submitBtn.disabled = loading;
}

// Read UUID from URL (?id=<uuid>)
const uuid = new URLSearchParams(window.location.search).get("id");

if (!uuid) {
  showMessage(
    "error",
    "Invalid or missing reset link. Please request a new one.",
  );
  document.querySelector("#submitResetBtn").disabled = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMessage();

  const newPassword = document.querySelector("#newPassword").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;

  if (newPassword.length < 4) {
    return showMessage("error", "Password must be at least 4 characters.");
  }
  if (newPassword !== confirmPassword) {
    return showMessage("error", "Passwords do not match. Please try again.");
  }

  setLoading(true);

  try {
    const result = await axios.post(`${api}/password/resetpassword/${uuid}`, {
      newPassword,
    });
    showMessage("success", result.data.message + " Redirecting to sign in…");
    form.reset();
    setTimeout(() => {
      window.location.href = "./signin.html";
    }, 1500);
  } catch (err) {
    const serverMsg = err.response?.data?.message;
    if (err.response?.status === 400) {
      showMessage(
        "error",
        serverMsg || "Reset link is invalid or has already been used.",
      );
    } else if (!err.response) {
      showMessage(
        "error",
        "Unable to reach the server. Please check your connection.",
      );
    } else {
      showMessage("error", serverMsg || "Reset failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
});
