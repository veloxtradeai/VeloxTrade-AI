const API = "https://velox-backend.velox-trade-ai.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("logged") === "1") {
    showApp();
  }
});

/* ================= AUTH ================= */

function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;

  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status !== "OK") {
        alert("Login failed");
        return;
      }
      localStorage.setItem("logged", "1");
      showApp();
    })
    .catch(() => alert("Server not reachable"));
}

function showApp() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  startSignalWatcher();
}

/* ================= SIGNAL WATCHER ================= */

function startSignalWatcher() {
  setInterval(async () => {
    try {
      const res = await fetch(API + "/signals");
      const data = await res.json();

      if (data.status === "SIGNAL") {
        openSignalPopup(data);
      }
    } catch (e) {
      console.log("Signal fetch error");
    }
  }, 5000);
}

/* ================= POPUP ================= */

function openSignalPopup(s) {
  document.getElementById("popup-stock").innerText = s.symbol;
  document.getElementById("popup-price").innerText = "₹" + s.entry;
  window.currentSignal = s;

  const popup = document.getElementById("ai-popup-container");
  popup.classList.remove("popup-hidden");
  popup.classList.add("popup-visible");
}

function closePopup() {
  const popup = document.getElementById("ai-popup-container");
  popup.classList.remove("popup-visible");
  popup.classList.add("popup-hidden");
}

/* ================= BUY ================= */

function executeOrder() {
  const s = window.currentSignal;
  const url = `https://groww.in/stocks/${s.symbol}`;
  window.open(url, "_blank");
}
