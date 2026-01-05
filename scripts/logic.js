const API = "https://<YOUR-WORKER>.workers.dev";

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
        document.getElementById("auth-screen").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
        startSignals();
      } else {
        alert("Login failed");
      }
    })
    .catch(() => alert("Server not reachable"));
}

function startSignals() {
  setInterval(async () => {
    const r = await fetch(API + "/signals");
    const d = await r.json();
    if (d.status === "SIGNAL") {
      alert("SIGNAL: " + d.symbol + " BUY");
    }
  }, 5000);
}
