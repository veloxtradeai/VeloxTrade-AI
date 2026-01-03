// VeloxTrade AI - Master Logic v2.0
const BACKEND_URL = "https://velox-backend.velox-trade-ai.workers.dev"; // आपका सही लिंक

// 1. LOGIN SYSTEM
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');
    const btn = document.querySelector('.btn-premium');

    if(!email || !pass) { msg.innerText = "Please enter details"; return; }
    
    btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> VERIFYING...';
    
    try {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pass })
        });

        const data = await response.json();

        if (data.status === "success") {
            // Screen hatao
            document.getElementById('login-modal').style.display = 'none';
            // Balance update karo
            document.querySelectorAll('#user-balance').forEach(el => el.innerText = `₹${data.user.balance}`);
            // Scanning shuru karo
            startScanning();
        } else {
            msg.innerText = "Wrong Email or Password!";
            btn.innerHTML = 'SECURE LOGIN';
        }
    } catch (e) {
        msg.innerText = "Connection Error! Check Internet.";
        btn.innerHTML = 'SECURE LOGIN';
    }
}

// 2. TAB SWITCHING SYSTEM
function switchTab(tabName) {
    // Sab tabs chupao
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    // Sab nav buttons gray karo
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('nav-active', 'text-yellow-400');
        n.classList.add('text-gray-500');
    });

    // Jo click kiya wo dikhao
    document.getElementById(tabName + '-tab').classList.add('active-tab');
    
    // Uska button highlight karo
    const navBtn = document.getElementById('nav-' + tabName);
    navBtn.classList.add('nav-active');
    navBtn.classList.remove('text-gray-500');
}

// 3. LIVE SIGNALS (Scanning)
async function startScanning() {
    fetchData(); // Turant ek baar
    setInterval(fetchData, 3000); // Har 3 second me
}

async function fetchData() {
    try {
        const res = await fetch(`${BACKEND_URL}/signals`);
        const data = await res.json();

        // Data Cards Update
        document.getElementById('best-symbol').innerText = data.symbol;
        document.getElementById('signal-price').innerText = `₹${data.price}`;
        document.getElementById('best-entry').innerText = `₹${data.price}`;
        document.getElementById('best-target').innerText = `₹${data.target}`;
        document.getElementById('best-sl').innerText = `₹${data.stoploss}`;
        document.getElementById('accuracy').innerText = data.accuracy;

        // Buy/Sell Colors Logic
        const badge = document.getElementById('signal-badge');
        const card = document.querySelector('.border-l-4');

        if(data.signal.includes("BUY")) {
            badge.innerText = "STRONG BUY";
            badge.className = "bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold";
            card.style.borderColor = "#22c55e"; // Green
        } else {
            badge.innerText = "STRONG SELL";
            badge.className = "bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold";
            card.style.borderColor = "#ef4444"; // Red
        }

    } catch (e) { console.log("Server waiting..."); }
}