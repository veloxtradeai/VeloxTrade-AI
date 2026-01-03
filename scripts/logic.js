// VeloxTrade AI Logic
const BACKEND_URL = "https://velox-backend.velox-trade-ai.workers.dev"; // आपका Worker Link

// 1. LOGIN FUNCTION
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');
    const btn = document.querySelector('.btn-premium');

    if(!email || !pass) { msg.innerText = "Please fill all fields"; return; }

    btn.innerText = "VERIFYING...";
    
    try {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pass })
        });

        const data = await response.json();

        if (data.status === "success") {
            // Login Success
            document.getElementById('login-modal').classList.add('hidden-modal');
            document.getElementById('user-balance').innerText = `₹${data.user.balance}`;
            startScanning(); // Start getting signals
        } else {
            msg.innerText = "Invalid Email or Password!";
            btn.innerText = "SECURE LOGIN";
        }
    } catch (error) {
        msg.innerText = "Server Error. Check Internet.";
        btn.innerText = "SECURE LOGIN";
    }
}

// 2. SIGNAL FETCHING (SCANNING REMOVER)
async function startScanning() {
    // Pehle turant fetch karo
    fetchSignalData();
    // Fir har 3 second me update karo
    setInterval(fetchSignalData, 3000);
}

async function fetchSignalData() {
    try {
        const res = await fetch(`${BACKEND_URL}/signals`);
        const data = await res.json();

        // UI Update karo
        document.getElementById('best-symbol').innerText = data.symbol;
        document.getElementById('best-symbol').classList.remove('animate-pulse-slow'); // Animation band
        
        document.getElementById('signal-type').innerText = `${data.signal} @ ₹${data.price}`;
        document.getElementById('best-entry').innerText = `₹${data.price}`;
        document.getElementById('best-target').innerText = `₹${data.target}`;
        document.getElementById('best-sl').innerText = `₹${data.stoploss}`;
        document.getElementById('accuracy').innerText = data.accuracy;

        // Color Logic
        if(data.signal.includes("BUY")) {
            document.getElementById('signal-type').className = "text-sm font-bold text-green-400 mt-1";
            document.querySelector('.border-l-4').className = "velox-card p-6 border-l-4 border-green-500 relative overflow-hidden group";
        } else {
            document.getElementById('signal-type').className = "text-sm font-bold text-red-400 mt-1";
            document.querySelector('.border-l-4').className = "velox-card p-6 border-l-4 border-red-500 relative overflow-hidden group";
        }

    } catch (e) {
        console.log("Waiting for server...");
    }
}