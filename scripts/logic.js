/* =========================================================
   VELOX TRADE AI — FINAL LOGIC.JS
   Compatible with your ORIGINAL index.html
   ========================================================= */

const API = "https://velox-backend.velox-trade-ai.workers.dev";

/* ===================== INIT ===================== */

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    showApp();
  }
});

/* ===================== AUTH ===================== */

function switchAuth(type) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");

  if (type === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    tabLogin.classList.add("bg-yellow-400", "text-black");
    tabSignup.classList.remove("bg-yellow-400", "text-black");
    tabSignup.classList.add("text-gray-400");
  } else {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    tabSignup.classList.add("bg-yellow-400", "text-black");
    tabLogin.classList.remove("bg-yellow-400", "text-black");
    tabLogin.classList.add("text-gray-400");
  }
}

function handleLogin() {
  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-pass").value;

  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pass })
  })
    .then(r => r.json())
    .then(d => {
      if (d.status === "OK") {
        localStorage.setItem("isLoggedIn", "true");
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
  checkMarketStatus();
  startScanner();
}

/* ===================== TABS ===================== */

function initTabs() {
  switchTab("home");
}

function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.remove("active-panel");
    p.style.display = "none";
  });

  const active = document.getElementById("tab-" + tab);
  if (active) {
    active.style.display = "block";
    active.classList.add("active-panel");
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

/* ===================== SIDEBAR ===================== */

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("sidebar-open");
  document.getElementById("overlay").classList.toggle("overlay-active");
}

/* ===================== MARKET GATE ===================== */

let marketLive = false;

function checkMarketStatus() {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const h = ist.getHours();
  const m = ist.getMinutes();

  marketLive =
    (h > 9 || (h === 9 && m >= 15)) &&
    (h < 15 || (h === 15 && m <= 30));

  if (marketLive) {
    setMarketLiveUI();
  } else {
    setMarketClosedUI();
  }
}

function setMarketLiveUI() {
  document.getElementById("market-status-text").innerText = "MARKET LIVE";
  document.getElementById("market-status-text").className =
    "text-[9px] text-green-400 font-bold tracking-widest uppercase";

  document.getElementById("ai-status-text").innerText =
    "AI Scanner active. Searching high-probability intraday setups...";
}

function setMarketClosedUI() {
  document.getElementById("market-status-text").innerText = "MARKET CLOSED";
  document.getElementById("market-status-text").className =
    "text-[9px] text-red-400 font-bold tracking-widest uppercase";

  document.getElementById("ai-status-text").innerText =
    "Market closed. Scanner paused.";
}

/* ===================== SCANNER ===================== */

let scannerInterval = null;
let activeTrade = null;

function startScanner() {
  if (!marketLive) return;
  if (scannerInterval) clearInterval(scannerInterval);

  scannerInterval = setInterval(fetchSignal, 5000);
}

async function fetchSignal() {
  if (!marketLive || activeTrade) return;

  try {
    const res = await fetch(API + "/signals");
    const data = await res.json();

    if (data.status === "LEVEL_READY") {
      activeTrade = data;
      showPopup(data);
    }
  } catch (e) {
    console.log("Signal fetch error");
  }
}

/* ===================== POPUP ===================== */

function showPopup(data) {
  document.getElementById("popup-stock").innerText = data.symbol;
  document.getElementById("popup-price").innerText = "₹" + data.entry;

  const popup = document.getElementById("ai-popup-container");
  popup.classList.remove("popup-hidden");
  popup.classList.add("popup-visible");

  playRing();
}

function closePopup() {
  const popup = document.getElementById("ai-popup-container");
  popup.classList.remove("popup-visible");
  popup.classList.add("popup-hidden");
  activeTrade = null;
}

/* ===================== EXECUTION ===================== */

function executeOrder() {
  if (!activeTrade) return;

  const broker = localStorage.getItem("broker") || "groww";
  let url = "";

  if (broker === "groww") url = `https://groww.in/stocks/${activeTrade.symbol}`;
  if (broker === "zerodha") url = "https://kite.zerodha.com";
  if (broker === "upstox") url = "https://pro.upstox.com";
  if (broker === "angel") url = "https://trade.angelbroking.com";

  window.open(url, "_blank");
  closePopup();
}

/* ===================== BROKER ===================== */

function setBroker(b) {
  localStorage.setItem("broker", b);
}

/* ===================== SOUND ===================== */

function playRing() {
  try {
    const audio = new Audio("/assets/alert.mp3");
    audio.play();
  } catch (_) {}
}

/* ===================== LOGOUT ===================== */

function logout() {
  localStorage.removeItem("isLoggedIn");
  location.reload();
}
