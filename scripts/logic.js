/* =========================================================
   VELOXTRADE PRO - FINAL LOGIC.JS
   Works with FINAL index.html (UI-only)
   ========================================================= */

const BACKEND = "https://velox-backend.velox-trade-ai.workers.dev";

let currentTab = "home";
let selectedBroker = null;
let autoScanner = null;

/* ================= BASIC ================= */

function $(id) {
  return document.getElementById(id);
}

/* ================= AUTH ================= */

function handleLogin() {
  $("auth-screen").classList.add("hidden");
  $("app-container").classList.remove("hidden");
  updateMarketStatus();
  startAutoScanner();
}

function logout() {
  location.reload();
}

/* ================= SIDEBAR ================= */

function toggleSidebar() {
  $("sidebar").classList.toggle("sidebar-open");
  $("overlay").classList.toggle("overlay-active");
}

/* ================= TABS ================= */

function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.remove("active-panel");
  });

  const target = document.querySelector(`main.tab-panel[data-tab="${tab}"]`) ||
                 document.querySelector(`main.tab-panel`);

  if ($("tab-" + tab)) {
    $("tab-" + tab).classList.add("active-panel");
  }

  currentTab = tab;
  closeSidebar();
}

function closeSidebar() {
  $("sidebar").classList.remove("sidebar-open");
  $("overlay").classList.remove("overlay-active");
}

/* ================= MARKET TIME ================= */

function isMarketLive() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  return (h > 9 || (h === 9 && m >= 15)) &&
         (h < 15 || (h === 15 && m <= 30));
}

function updateMarketStatus() {
  const live = isMarketLive();

  const statusText = document.querySelector("header p");
  if (statusText) {
    statusText.innerText = live ? "MARKET LIVE" : "MARKET CLOSED";
    statusText.className = live
      ? "text-[9px] text-green-400 font-bold tracking-widest uppercase"
      : "text-[9px] text-red-400 font-bold tracking-widest uppercase";
  }

  const aiText = document.querySelector("main .velox-card p");
  if (aiText) {
    aiText.innerText = live
      ? "Market live. AI scanning enabled."
      : "Market closed. Scanner paused.";
  }
}

/* ================= BROKER ================= */

function setBroker(broker) {
  selectedBroker = broker;
  alert("Broker selected: " + broker.toUpperCase());
}

/* ================= SCREENER ================= */

async function runScreener() {
  if (!isMarketLive()) {
    alert("Market closed. Screener disabled.");
    return;
  }

  const box = $("screener-results");
  if (!box) return;

  box.innerText = "Scanning market…";

  try {
    const res = await fetch(BACKEND + "/screener", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        broker: selectedBroker || "default"
      })
    });

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      box.innerText = "No high probability setup found.";
      return;
    }

    box.innerHTML = "";
    data.forEach(stock => {
      const d = document.createElement("div");
      d.className = "bg-black/30 p-3 rounded-xl border border-white/5";
      d.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold text-white">${stock.symbol}</div>
            <div class="text-xs text-gray-400">
              Entry ${stock.entry} | SL ${stock.sl} | TGT ${stock.target}
            </div>
          </div>
          <div class="text-green-400 font-bold">${stock.confidence}%</div>
        </div>
      `;
      box.appendChild(d);
    });

  } catch (e) {
    console.error(e);
    box.innerText = "Backend not reachable.";
  }
}

/* ================= AUTO AI SCANNER ================= */

function startAutoScanner() {
  if (!isMarketLive()) return;

  stopAutoScanner();

  autoScanner = setInterval(async () => {
    try {
      const res = await fetch(
        BACKEND + "/signal?broker=" + (selectedBroker || "default")
      );
      const data = await res.json();

      if (data && data.symbol) {
        showPopup(data);
      }
    } catch (e) {
      console.warn("Waiting for AI signal");
    }
  }, 15000);
}

function stopAutoScanner() {
  if (autoScanner) {
    clearInterval(autoScanner);
    autoScanner = null;
  }
}

/* ================= POPUP ================= */

function showPopup(signal) {
  $("popup-stock").innerText = signal.symbol;
  $("popup-price").innerText = "₹" + signal.entry;
  $("ai-popup-container").classList.remove("popup-hidden");
  $("ai-popup-container").classList.add("popup-visible");
  playSound();
}

function closePopup() {
  $("ai-popup-container").classList.remove("popup-visible");
  $("ai-popup-container").classList.add("popup-hidden");
}

function executeOrder() {
  alert("Redirecting to broker app for order execution.");
  closePopup();
}

/* ================= SOUND ================= */

function playSound() {
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  );
  audio.play().catch(() => {});
}

/* ================= INIT ================= */

setInterval(updateMarketStatus, 60000);
