const API = "https://YOUR-WORKER-URL";

/* ===== LOGIN ===== */
async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;

  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert("Login failed");
    return;
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);
  showApp();
  startScanner();
}

/* ===== AI SCANNER ===== */
function startScanner() {
  setInterval(async () => {
    const res = await fetch(API + "/market/scan");
    const data = await res.json();

    if (data.status === "SIGNAL") {
      showSignalPopup(data);
    }
  }, 4000);
}

/* ===== POPUP ===== */
function showSignalPopup(s) {
  document.getElementById("popup-stock").innerText = s.symbol;
  document.getElementById("popup-price").innerText = "₹" + s.entry;

  document.getElementById("ai-popup-container")
    .classList.replace("popup-hidden", "popup-visible");

  window.currentSignal = s;
}

/* ===== BUY ===== */
function executeOrder() {
  const s = window.currentSignal;
  const broker = localStorage.getItem("broker") || "groww";

  let url = "";
  if (broker === "groww") {
    url = `https://groww.in/stocks/${s.symbol}`;
  } else if (broker === "zerodha") {
    url = `https://kite.zerodha.com`;
  }

  window.open(url, "_blank");
}

/* ===== CLOSE ===== */
function closePopup() {
  document.getElementById("ai-popup-container")
    .classList.replace("popup-visible", "popup-hidden");
}
