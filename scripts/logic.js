const API = "https://YOUR-WORKER-URL"; // ← yahan apna worker URL

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
    .then(r => r.json())
    .then(d => {
      if (d.status !== "OK") {
        alert("Login failed");
        return;
      }
      localStorage.setItem("logged", "1");
      showApp();
    })
    .catch(() => alert("Server error"));
}

function showApp() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  startSignalWatcher();
}

/* ================= SIGNAL WATCHER ================= */

function startSignalWatcher() {
  setInterval(async () => {
    const res = await fetch(API + "/signals");
    const data = await res.json();

    if (data.status === "SIGNAL") {
      openSignalPopup(data);
    }
  }, 5000);
}

/* ================= POPUP ================= */

function openSignalPopup(s) {
  document.getElementById("popup-stock").innerText = s.symbol;
  document.getElementById("popup-price").innerText = "₹" + s.entry;
  window.currentSignal = s;

  const p = document.getElementById("ai-popup-container");
  p.classList.remove("popup-hidden");
  p.classList.add("popup-visible");
}

function closePopup() {
  const p = document.getElementById("ai-popup-container");
  p.classList.remove("popup-visible");
  p.classList.add("popup-hidden");
}

/* ================= BUY ================= */

function executeOrder() {
  const s = window.currentSignal;
  // Broker redirect (Groww example)
  const url = `https://groww.in/stocks/${s.symbol}`;
  window.open(url, "_blank");
}
