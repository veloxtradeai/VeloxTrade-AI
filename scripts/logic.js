const API = "https://velox-backend.velox-trade-ai.workers.dev";

/* ================= INIT ================= */

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
      if (d.status === "OK") {
        localStorage.setItem("logged", "1");
        showApp();
      } else {
        alert("Login failed");
      }
    })
    .catch(() => alert("Backend not reachable"));
}

function showApp() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  initTabs();
  initMarketStatus();
}

/* ================= TABS ================= */

function initTabs() {
  switchTab("home");
}

function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.remove("active-panel");
    p.style.display = "none";
  });

  const target = document.getElementById("tab-" + tab);
  if (target) {
    target.style.display = "block";
    setTimeout(() => target.classList.add("active-panel"), 10);
  }

  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.remove("text-yellow-400");
    b.classList.add("text-gray-500");
  });

  const btn = document.getElementById("btn-" + tab);
  if (btn) {
    btn.classList.add("text-yellow-400");
    btn.classList.remove("text-gray-500");
  }
}

/* ================= SIDEBAR ================= */

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("sidebar-open");
  document.getElementById("overlay").classList.toggle("overlay-active");
}

/* ================= MARKET STATUS ================= */

function initMarketStatus() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  const marketOpen = (h > 9 || (h === 9 && m >= 15)) &&
                     (h < 15 || (h === 15 && m <= 30));

  if (marketOpen) {
    setMarketLive();
  } else {
    setMarketClosed();
  }
}

function setMarketLive() {
  document.getElementById("market-status-text").innerText = "MARKET LIVE";
  document.getElementById("market-status-text").className =
    "text-[9px] text-green-400 font-bold tracking-widest uppercase";

  document.getElementById("ai-status-text").innerText =
    "AI Scanner ready. Waiting for valid setups...";
}

function setMarketClosed() {
  document.getElementById("market-status-text").innerText = "MARKET CLOSED";
  document.getElementById("market-status-text").className =
    "text-[9px] text-red-400 font-bold tracking-widest uppercase";

  document.getElementById("ai-status-text").innerText =
    "Market closed. Scanner inactive.";
}

/* ================= SETTINGS TOGGLES ================= */

function toggleSetting(el) {
  el.classList.toggle("fa-toggle-on");
  el.classList.toggle("fa-toggle-off");
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.removeItem("logged");
  location.reload();
}
