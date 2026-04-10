const api = "http://localhost:3000";

const form = document.querySelector("#signupForm");
const submitBtn = document.querySelector("#submitSignupBtn");
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const userName = document.querySelector("#name").value.trim();
  const userEmail = document.querySelector("#email").value.trim();
  const userPassword = document.querySelector("#password").value;

  setLoading(true);

  try {
    const result = await axios.post(`${api}/user/signup`, {
      name: userName,
      email: userEmail,
      password: userPassword,
    });
    console.log(result);
    showMessage("success", "Account created successfully! Redirecting…");
    setTimeout(() => {
      window.location.href = "signin.html";
    }, 600);
    form.reset();
  } catch (err) {
    console.error(err);
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message || err.response?.data?.error;

    if (
      status === 409 ||
      (serverMsg && /already exist|duplicate|taken/i.test(serverMsg))
    ) {
      showMessage(
        "error",
        "An account with this email already exists. Try signing in instead.",
      );
    } else if (status === 400) {
      showMessage(
        "error",
        serverMsg || "Invalid details. Please check your inputs and try again.",
      );
    } else if (!err.response) {
      showMessage(
        "error",
        "Unable to reach the server. Please check your connection.",
      );
    } else {
      showMessage(
        "error",
        serverMsg || "Signup failed. Please try again later.",
      );
    }
  } finally {
    setLoading(false);
  }
});
