/* =========================================================
   VELOX TRADE AI — FRONTEND LOGIC (PHASE-1 FULL)
   - No fake popup
   - Market gate respected
   - Continuous scanner
   - Broker-agnostic execution framework
   ========================================================= */

const API = "https://velox-backend.velox-trade-ai.workers.dev";

/* ===================== APP INIT ===================== */

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("logged") === "1") {
    showApp();
  }
});

/* ===================== AUTH ===================== */

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
  initScanner();
}

/* ===================== TABS & NAV ===================== */

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

/* ===================== SIDEBAR ===================== */

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("sidebar-open");
  document.getElementById("overlay").classList.toggle("overlay-active");
}

/* ===================== MARKET GATE ===================== */

let marketLive = false;

function initMarketStatus() {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const h = ist.getHours();
  const m = ist.getMinutes();

  marketLive =
    (h > 9 || (h === 9 && m >= 15)) &&
    (h < 15 || (h === 15 && m <= 30));

  if (marketLive) {
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
    "AI Scanner active. Searching for high-probability setups…";
}

function setMarketClosed() {
  document.getElementById("market-status-text").innerText = "MARKET CLOSED";
  document.getElementById("market-status-text").className =
    "text-[9px] text-red-400 font-bold tracking-widest uppercase";

  document.getElementById("ai-status-text").innerText =
    "Market closed. Scanner paused.";
}

/* ===================== SCANNER (CONTINUOUS) ===================== */

let scannerTimer = null;
let activeTrade = null; // holds current active trade state

function initScanner() {
  if (!marketLive) return; // respect gate
  if (scannerTimer) clearInterval(scannerTimer);

  // Continuous scan while market is live
  scannerTimer = setInterval(fetchSignals, 5000);
}

async function fetchSignals() {
  try {
    const res = await fetch(API + "/signals");
    const data = await res.json();

    // Backend controls truth
    if (data.status === "LEVEL_READY") {
      // If no active trade, present new opportunity
      if (!activeTrade) {
        presentSignal(data);
      }
    }
  } catch (e) {
    console.log("Signal fetch error");
  }
}

/* ===================== SIGNAL PRESENTATION ===================== */

function presentSignal(s) {
  activeTrade = {
    symbol: s.symbol,
    entry: s.entry,
    sl: s.stoploss,
    targets: s.targets,
    trailStep: Math.max(20, Math.round((s.entry - s.stoploss) * 0.4)),
    lastTrailAt: s.entry
  };

  // Fill popup
  document.getElementById("popup-stock").innerText = s.symbol;
  document.getElementById("popup-price").innerText = "₹" + s.entry;

  openPopup();
  playRing();
}

/* ===================== POPUP & ALERTS ===================== */

function openPopup() {
  const p = document.getElementById("ai-popup-container");
  p.classList.remove("popup-hidden");
  p.classList.add("popup-visible");
}

function closePopup() {
  const p = document.getElementById("ai-popup-container");
  p.classList.remove("popup-visible");
  p.classList.add("popup-hidden");
}

function playRing() {
  try {
    const audio = new Audio("/assets/alert.mp3"); // optional asset
    audio.play();
  } catch (_) {}
}

/* ===================== EXECUTION (BROKER-AGNOSTIC) ===================== */

function executeOrder() {
  if (!activeTrade) return;

  const broker = localStorage.getItem("broker") || "groww";
  let url = "";

  // Deep-link / web redirect framework
  if (broker === "groww") {
    url = `https://groww.in/stocks/${activeTrade.symbol}`;
  } else if (broker === "zerodha") {
    url = "https://kite.zerodha.com";
  } else if (broker === "upstox") {
    url = "https://pro.upstox.com";
  } else if (broker === "angel") {
    url = "https://trade.angelbroking.com";
  }

  window.open(url, "_blank");
  closePopup();

  // Start auto-management hooks
  startAutoManagement();
}

/* ===================== AUTO MANAGEMENT (FRAMEWORK) ===================== */
/* NOTE:
   - Real price feed will come from broker/data adapter (Phase-2)
   - Below logic is hook-ready (no fake updates)
*/

function startAutoManagement() {
  // Placeholder hook: when real LTP feed attaches,
  // call onPriceUpdate(ltp)
}

function onPriceUpdate(ltp) {
  if (!activeTrade) return;

  // Trailing SL logic
  if (ltp >= activeTrade.lastTrailAt + activeTrade.trailStep) {
    activeTrade.sl += activeTrade.trailStep;
    activeTrade.lastTrailAt = ltp;
  }

  // Exit alerts
  if (ltp <= activeTrade.sl) {
    alertExit("STOPLOSS HIT");
    activeTrade = null;
  }

  if (ltp >= activeTrade.targets[activeTrade.targets.length - 1]) {
    alertExit("TARGET ACHIEVED");
    activeTrade = null;
  }
}

function alertExit(msg) {
  alert(msg);
  playRing();
}

/* ===================== SETTINGS / UTIL ===================== */

function setBroker(name) {
  localStorage.setItem("broker", name);
}

function logout() {
  localStorage.removeItem("logged");
  location.reload();
}
