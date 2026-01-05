/* FILENAME: scripts/logic.js
   DESCRIPTION: Main Logic for Velox Trade AI Terminal
   CONNECTS TO: https://velox-backend.velox-trade-ai.workers.dev
*/

// --- 1. CONFIGURATION ---
const CONFIG = {
    API_URL: "https://velox-backend.velox-trade-ai.workers.dev",
    SOUND_ENABLED: true,
    ANIMATION_SPEED: 300
};

// --- 2. AUTHENTICATION SYSTEM ---
async function appLogin() {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-pass');
    const btn = document.getElementById('btn-login');
    const msg = document.getElementById('login-msg');

    // Reset UI
    msg.innerText = "";
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> CONNECTING SECURELY...';
    btn.disabled = true;

    try {
        // Real Backend Call
        const response = await fetch(`${CONFIG.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: emailField.value, 
                password: passField.value 
            })
        });

        const data = await response.json();

        if (data.status === "SUCCESS") {
            // Success: Play Sound & Switch View
            playSound('success');
            document.getElementById('view-login').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('view-login').style.display = 'none';
                document.getElementById('view-app').classList.remove('hidden');
                
                // Update User Balance from Backend
                if(data.user && data.user.balance) {
                    document.getElementById('user-balance').innerText = `₹${data.user.balance.toLocaleString()}`;
                }
            }, 500);
        } else {
            // Server Error Message
            msg.innerText = data.message || "Access Denied";
            playSound('error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

    } catch (error) {
        console.error("Login Error:", error);
        msg.innerText = "Error: Cannot connect to Velox Cloud.";
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function appLogout() {
    if(confirm("Are you sure you want to disconnect from the terminal?")) {
        location.reload();
    }
}

// --- 3. SCANNER & SIGNAL ENGINE ---
async function runScanner() {
    const btn = document.getElementById('btn-scan');
    const originalContent = btn.innerHTML;
    
    // UI Loading State
    btn.innerHTML = '<i class="fas fa-satellite-dish fa-spin"></i> ANALYZING MARKET DATA...';
    btn.classList.add('scanner-active'); // Adds glowing border
    
    // Play scanning sound loop
    const scanSound = setInterval(() => playSound('tick'), 500);

    try {
        // Fetch Signal from Cloudflare Backend
        const response = await fetch(`${CONFIG.API_URL}/signals`);
        const data = await response.json();

        // Stop loading UI
        clearInterval(scanSound);
        btn.innerHTML = originalContent;
        btn.classList.remove('scanner-active');

        if (data.status === "SIGNAL_FOUND") {
            showPopup(data);
        } else if (data.status === "MARKET_CLOSED") {
            alert("MARKET IS CLOSED\nScanner operates between 09:15 and 15:30 IST.");
        } else {
            // No setup found
            alert(data.message || "No high-probability setups found right now.");
        }

    } catch (error) {
        clearInterval(scanSound);
        console.error(error);
        btn.innerHTML = originalContent;
        btn.classList.remove('scanner-active');
        alert("Network Error: Could not fetch data from Velox Engine.");
    }
}

// --- 4. POPUP SYSTEM ---
function showPopup(data) {
    const popup = document.getElementById('signal-popup');
    
    // Populate Data
    document.getElementById('sig-symbol').innerText = data.symbol;
    
    // Type Styling (Buy/Sell)
    const typeEl = document.getElementById('sig-type');
    typeEl.innerText = data.type + " SIGNAL";
    if (data.type === "BUY") {
        typeEl.className = "inline-block px-3 py-1 bg-green-500 text-black text-xs font-bold rounded mb-4 shadow-lg shadow-green-500/50";
        document.getElementById('sig-symbol').className = "text-3xl font-black text-green-400 mb-1";
    } else {
        typeEl.className = "inline-block px-3 py-1 bg-red-500 text-black text-xs font-bold rounded mb-4 shadow-lg shadow-red-500/50";
        document.getElementById('sig-symbol').className = "text-3xl font-black text-red-400 mb-1";
    }

    document.getElementById('sig-entry').innerText = data.entry;
    document.getElementById('sig-sl').innerText = data.stoploss;
    document.getElementById('sig-tgt').innerText = data.targets[0]; // Showing Target 1
    
    // Logic & Confidence
    document.getElementById('sig-logic').innerText = data.logic ? data.logic.join(", ") : "Trend Following";
    document.getElementById('sig-conf').innerText = data.confidence;

    // Show Popup with Sound
    playSound('alert');
    popup.classList.remove('hidden');
    
    // Vibration for Mobile
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function closePopup() {
    document.getElementById('signal-popup').classList.add('hidden');
}

function executeTrade() {
    // Phase 2: Broker Integration will go here
    const symbol = document.getElementById('sig-symbol').innerText;
    alert(`ORDER SENT: ${symbol}\n\nConnecting to Broker API...\n(This feature will be live in Phase 2)`);
    closePopup();
}

// --- 5. UI NAVIGATION & TABS ---
function switchTab(tabId) {
    // Hide all panels
    document.querySelectorAll('.active-panel').forEach(el => {
        el.classList.remove('active-panel');
        el.classList.add('hidden-panel');
    });
    
    // Show target panel
    const target = document.getElementById('tab-' + tabId);
    if(target) {
        target.classList.remove('hidden-panel');
        target.classList.add('active-panel');
    }

    // Update Bottom Menu Styling
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-yellow-500');
        btn.classList.add('text-gray-500');
    });
    
    // Find the button that was clicked (safely)
    const activeBtn = event.currentTarget;
    if(activeBtn) {
        activeBtn.classList.remove('text-gray-500');
        activeBtn.classList.add('text-yellow-500');
    }
}

function toggleMenu() {
    // For the side menu (if implemented in future or expanded)
    alert("Full Menu coming in next update.");
}

// --- 6. SOUND ENGINE ---
function playSound(type) {
    if (!CONFIG.SOUND_ENABLED) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'success') {
        // High pitch pleasant chime
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } 
    else if (type === 'error') {
        // Low pitch buzz
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
    else if (type === 'alert') {
        // Attention grabbing siren
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(440, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
    else if (type === 'tick') {
        // Soft tick for scanning
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    }
}
