// ===== FINAL STABLE LOGIC =====

function handleLogin() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  updateMarketStatus();
}

function logout() {
  location.reload();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("sidebar-open");
  document.getElementById("overlay").classList.toggle("overlay-active");
}

function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active-panel"));
  const t = document.getElementById("tab-" + tab);
  if (t) t.classList.add("active-panel");
  document.getElementById("sidebar").classList.remove("sidebar-open");
  document.getElementById("overlay").classList.remove("overlay-active");
}

function isMarketLive() {
  const d = new Date();
  const h = d.getHours(), m = d.getMinutes();
  return (h > 9 || (h === 9 && m >= 15)) && (h < 15 || (h === 15 && m <= 30));
}

function updateMarketStatus() {
  const live = isMarketLive();
  const txt = document.getElementById("market-status-text");
  const dot = document.getElementById("status-dot");
  const ai = document.getElementById("ai-status-text");

  txt.innerText = live ? "MARKET LIVE" : "MARKET CLOSED";
  txt.className = live
    ? "text-[9px] text-green-400 font-bold tracking-widest uppercase"
    : "text-[9px] text-red-400 font-bold tracking-widest uppercase";

  dot.className = "absolute bottom-0 right-0 w-3 h-3 border-2 border-black rounded-full " + (live ? "bg-green-500" : "bg-red-500");
  if (ai) ai.innerText = live ? "Market live. Scanner enabled." : "Market closed. Scanner paused.";
}

function runScreener() {
  if (!isMarketLive()) {
    document.getElementById("screener-results").innerText = "Market closed.";
    return;
  }
  document.getElementById("screener-results").innerText = "Scanning... (backend will plug here)";
}

// keep status fresh
setInterval(updateMarketStatus, 60000);
