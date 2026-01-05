/* =========================================================
   VELOXTRADE PRO – FINAL UI & FLOW LOGIC
   Compatible with your original index.html
   NO FAKE POPUPS | NO RANDOM DATA
   ========================================================= */

const BACKEND_URL = "https://velox-backend.velox-trade-ai.workers.dev";

/* ------------------ APP STATE ------------------ */
const AppState = {
  loggedIn: false,
  activeTab: "home",
  marketLive: false,
  scannerRunning: false,
  popupVisible: false,
};

/* ------------------ INIT ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    showApp();
  }
});

/* ------------------ AUTH ------------------ */
function switchAuth(type) {
  document.getElementById("login-form").classList.toggle("hidden", type !== "login");
  document.getElementById("signup-form").classList.toggle("hidden", type !== "signup");

  document.getElementById("tab-login").classList.toggle("bg-yellow-400", type === "login");
  document.getElementById("tab-signup").classList.toggle("bg-yellow-400", type === "signup");
}

async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;

  try {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    localStorage.setItem("isLoggedIn", "true");
    showApp();
  } catch (e) {
    alert("Login failed. Backend not reachable or invalid credentials.");
  }
}

function showApp() {
  AppState.loggedIn = true;
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  checkMarketStatus();
}

/* ------------------ SIDEBAR ------------------ */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("sidebar-open");
  document.getElementById("overlay").classList.toggle("overlay-active");
}

/* ------------------ TABS ------------------ */
function switchTab(tab) {
  AppState.activeTab = tab;

  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.remove("active-panel");
    p.style.display = "none";
  });

  const panel = document.getElementById(`tab-${tab}`);
  panel.style.display = "block";
  setTimeout(() => panel.classList.add("active-panel"), 10);

  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.remove("text-yellow-400");
    b.classList.add("text-gray-500");
  });

  const btn = document.getElementById(`btn-${tab}`);
  if (btn) {
    btn.classList.add("text-yellow-400");
    btn.classList.remove("text-gray-500");
  }
}

/* ------------------ MARKET STATUS ------------------ */
function checkMarketStatus() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  AppState.marketLive =
    (h > 9 || (h === 9 && m >= 15)) &&
    (h < 15 || (h === 15 && m <= 30));

  if (AppState.marketLive) {
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
    "Market live. Waiting for backend signals...";

  startScanner();
}

function setMarketClosed() {
  document.getElementById("market-status-text").innerText = "MARKET CLOSED";
  document.getElementById("ai-status-text").innerText =
    "Market closed. Scanner paused.";

  stopScanner();
}

/* ------------------ SCANNER ------------------ */
function startScanner() {
  if (AppState.scannerRunning) return;
  AppState.scannerRunning = true;

  scanLoop();
}

function stopScanner() {
  AppState.scannerRunning = false;
}

async function scanLoop() {
  while (AppState.marketLive && AppState.scannerRunning) {
    try {
      const res = await fetch(`${BACKEND_URL}/signals`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      if (data && data.signal && !AppState.popupVisible) {
        triggerPopup(data.symbol, data.price);
      }
    } catch (e) {
      console.log("Scanner idle – no valid signal");
    }

    await new Promise(r => setTimeout(r, 10000));
  }
}

/* ------------------ POPUP ------------------ */
function triggerPopup(stock, price) {
  if (!AppState.marketLive) return;

  AppState.popupVisible = true;
  document.getElementById("popup-stock").innerText = stock;
  document.getElementById("popup-price").innerText = `₹${price}`;

  const popup = document.getElementById("ai-popup-container");
  popup.classList.remove("popup-hidden");
  popup.classList.add("popup-visible");
}

function closePopup() {
  AppState.popupVisible = false;
  const popup = document.getElementById("ai-popup-container");
  popup.classList.remove("popup-visible");
  popup.classList.add("popup-hidden");
}

/* ------------------ BROKER CONNECT (FLOW ONLY) ------------------ */
document.addEventListener("click", e => {
  if (e.target.innerText?.includes("Groww")) {
    window.open("https://groww.in", "_blank");
  }
  if (e.target.innerText?.includes("Zerodha")) {
    window.open("https://zerodha.com", "_blank");
  }
  if (e.target.innerText?.includes("Upstox")) {
    window.open("https://upstox.com", "_blank");
  }
  if (e.target.innerText?.includes("Angel")) {
    window.open("https://angelone.in", "_blank");
  }
});
