// VELOX PRO LOGIC CORE v2.5
const BACKEND_URL = "https://velox-backend.velox-trade-ai.workers.dev"; // आपका सर्वर लिंक

// 1. AUTHENTICATION SYSTEM
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');
    const btn = document.querySelector('.btn-action');

    if(!email || !pass) { msg.innerText = "ACCESS DENIED: MISSING CREDENTIALS"; return; }
    
    btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> AUTHENTICATING...';
    
    try {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pass })
        });

        const data = await response.json();

        if (data.status === "success") {
            msg.className = "text-center text-xs text-green-400 min-h-[20px]";
            msg.innerText = "ACCESS GRANTED. LOADING MODULES...";
            setTimeout(() => {
                document.getElementById('login-modal').style.display = 'none';
                document.getElementById('user-balance').innerText = `₹${data.user.balance.toLocaleString('en-IN')}`;
                startScanning();
            }, 1000);
        } else {
            msg.innerText = "INVALID CREDENTIALS DETECTED";
            btn.innerHTML = 'INITIATE SYSTEM';
        }
    } catch (e) {
        msg.innerText = "SERVER UNREACHABLE. RETRYING...";
        btn.innerHTML = 'INITIATE SYSTEM';
    }
}

// 2. TAB NAVIGATION
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active-tab');
        t.style.opacity = '0';
    });
    
    // Smooth fade in
    const active = document.getElementById(tabName + '-tab');
    active.classList.add('active-tab');
    setTimeout(() => active.style.opacity = '1', 50);

    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active', 'text-cyan-400');
        n.classList.add('text-gray-600');
    });

    // Update Icon Styles
    const navBtn = document.querySelector(`.nav-item[onclick="switchTab('${tabName}')"]`);
    navBtn.classList.add('active');
    navBtn.classList.remove('text-gray-600');
}

// 3. CORE TRADING LOGIC
async function startScanning() {
    fetchData(); 
    setInterval(fetchData, 3000); 
}

async function fetchData() {
    try {
        const res = await fetch(`${BACKEND_URL}/signals`);
        const data = await res.json();

        // Update UI Elements
        document.getElementById('best-symbol').innerText = data.symbol;
        document.getElementById('signal-price').innerText = `₹${data.price}`;
        document.getElementById('best-entry').innerText = `₹${data.price}`;
        document.getElementById('best-target').innerText = `₹${data.target}`;
        document.getElementById('best-sl').innerText = `₹${data.stoploss}`;
        document.getElementById('accuracy').innerText = data.accuracy;

        const badge = document.getElementById('signal-badge');
        const card = document.getElementById('main-signal-card');

        if(data.signal.includes("BUY")) {
            badge.innerHTML = '<i class="fas fa-arrow-up"></i> STRONG CALL';
            badge.className = "bg-green-500 text-black px-3 py-1 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse";
            card.style.borderColor = "#22c55e"; 
            document.getElementById('best-symbol').classList.add('text-green-400');
            document.getElementById('best-symbol').classList.remove('text-red-400');
        } else {
            badge.innerHTML = '<i class="fas fa-arrow-down"></i> STRONG PUT';
            badge.className = "bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse";
            card.style.borderColor = "#ef4444";
            document.getElementById('best-symbol').classList.add('text-red-400');
            document.getElementById('best-symbol').classList.remove('text-green-400');
        }

    } catch (e) { console.log("Data sync..."); }
}

function executeOrder(type) {
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> PROCESSING...';
    
    setTimeout(() => {
        alert(`${type} ORDER PLACED SUCCESSFULLY!\nBroker: Simulated\nStatus: Pending -> Complete`);
        btn.innerHTML = originalText;
        switchTab('portfolio'); // Auto switch to see trades
    }, 1500);
}
