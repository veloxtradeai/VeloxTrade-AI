/* FILENAME: logic.js
   DESCRIPTION: Real integration with VeloxTrade Backend
   STATUS: PRODUCTION READY (No Fake Data)
*/

const CONFIG = {
    // Tumhara Real Backend Link
    API_URL: "https://velox-backend.velox-trade-ai.workers.dev",
    MARKET_OPEN: 9,
    MARKET_CLOSE: 16,
};

// Global User State (Frontend Memory)
let userState = {
    userId: null,
    userName: "Guest",
    balance: 0, // Backend se aayega
    isLoggedIn: false,
    orders: [] // Local temporary storage
};

// ============================================
// 1. AUTHENTICATION (Real Connect)
// ============================================

async function appLogin() {
    const btn = document.querySelector('#login-form button');
    const userInput = document.getElementById('login-user').value.trim();
    const passInput = document.getElementById('login-pass').value.trim();
    
    if (!userInput || !passInput) {
        alert("❌ User ID aur Password fill karo");
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CONNECTING...';
    btn.disabled = true;

    try {
        const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userInput, password: passInput })
        });

        const data = await response.json();

        if (data.success) {
            // Login Success
            userState.isLoggedIn = true;
            userState.userId = data.user.id;
            userState.userName = data.user.name;
            userState.balance = data.user.balance;

            playSound('success');
            
            // UI Update
            updateUserUI();
            
            // Screen Switch
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('app-main').classList.remove('hidden');
            
            // Load Orders History if any
            fetchOrders();
            
        } else {
            alert("❌ " + (data.message || "Login Failed"));
            playSound('error');
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("❌ Server Error: Backend connect nahi ho raha.");
    } finally {
        btn.innerHTML = 'ACCESS TERMINAL';
        btn.disabled = false;
    }
}

// ============================================
// 2. SCANNER ENGINE (Calls Backend RSI Logic)
// ============================================

async function runScanner() {
    const btn = document.getElementById('scanner-btn');
    const originalContent = btn.innerHTML;
    
    // UI Loading State
    btn.innerHTML = '<i class="fas fa-satellite-dish fa-spin"></i> ANALYZING MARKET...';
    btn.disabled = true;
    playSound('tick');

    try {
        // Backend Call (Real RSI Calculation)
        const response = await fetch(`${CONFIG.API_URL}/signals/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userState.userId })
        });

        const data = await response.json();

        btn.innerHTML = originalContent;
        btn.disabled = false;

        if (data.success && data.signals.length > 0) {
            // Show the best signal found
            const bestSignal = data.signals[0];
            showPopup(bestSignal);
            playSound('alert');
        } else {
            // Real Market behavior: No signal found
            alert("📊 Market Neutral hai. Koi strong RSI setup nahi mila.");
        }

    } catch (error) {
        console.error("Scanner Error:", error);
        alert("❌ Scanning Failed. Check Internet.");
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

// ============================================
// 3. TRADE EXECUTION (Real Order Placement)
// ============================================

function showPopup(signal) {
    // Populate Popup with Data
    document.getElementById('pop-symbol').textContent = signal.symbol;
    document.getElementById('pop-type').textContent = signal.type === 'BUY' ? '🟢 BUY SETUP' : '🔴 SELL SETUP';
    document.getElementById('pop-entry').textContent = signal.entry.toFixed(2);
    document.getElementById('pop-sl').textContent = signal.sl.toFixed(2);
    document.getElementById('pop-tgt').textContent = signal.target1.toFixed(2);
    document.getElementById('pop-conf').textContent = Math.round(signal.confidence) + '%';
    document.getElementById('pop-ratio').textContent = "1:1.5"; // Standard logic
    
    // Confidence Bar
    document.getElementById('pop-confidence-bar').style.width = signal.confidence + '%';
    
    // Technical Logic Text
    document.getElementById('pop-setup-info').innerHTML = `
        <p><strong>Logic:</strong> ${signal.logic}</p>
        <p class="text-xs text-gray-400 mt-1">Real-time RSI analysis from Yahoo Finance</p>
    `;
    
    document.getElementById('trade-popup').classList.add('show');
}

async function executeTrade() {
    const symbol = document.getElementById('pop-symbol').textContent;
    const type = document.getElementById('pop-type').textContent.includes('BUY') ? 'BUY' : 'SELL';
    const entry = parseFloat(document.getElementById('pop-entry').textContent);

    // Close Popup immediately
    closePopup();

    try {
        const response = await fetch(`${CONFIG.API_URL}/orders/place`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userState.userId,
                symbol: symbol,
                type: type,
                entry: entry,
                broker: "ZERODHA" // Default or selected broker
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ Order Sent to Exchange!\nID: ${data.orderId}`);
            playSound('success');
            // Refresh Orders List
            fetchOrders();
        } else {
            alert("❌ Trade Failed: " + data.message);
        }

    } catch (error) {
        alert("❌ Order Error");
    }
}

// ============================================
// 4. DATA SYNC (Orders & UI)
// ============================================

async function fetchOrders() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/orders/history`);
        const data = await response.json();
        
        if (data.success) {
            userState.orders = data.orders;
            renderOrders();
        }
    } catch (e) {
        console.log("Could not fetch history");
    }
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    list.innerHTML = '';

    if (userState.orders.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-500 text-xs py-4">No active orders</p>';
        return;
    }

    userState.orders.forEach(order => {
        const isBuy = order.type === 'BUY';
        const html = `
            <div class="velox-card p-3 mb-2 border-l-4 ${isBuy ? 'border-blue-500' : 'border-red-500'}">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-sm">${order.symbol}</span>
                    <span class="text-[10px] ${isBuy ? 'text-blue-400' : 'text-red-400'} font-bold">${order.type}</span>
                </div>
                <div class="flex justify-between mt-1 text-xs text-gray-400">
                    <span>Entry: ₹${order.entry}</span>
                    <span class="text-yellow-400">${order.status}</span>
                </div>
            </div>
        `;
        list.innerHTML += html;
    });
}

function updateUserUI() {
    document.getElementById('header-user').textContent = userState.userName;
    document.getElementById('header-balance').textContent = '₹' + userState.balance.toLocaleString();
    document.getElementById('header-initials').textContent = userState.userName.substring(0,2).toUpperCase();
    document.getElementById('sidebar-user').textContent = userState.userName;
}

// ============================================
// 5. UTILITIES (Navigation & Sound)
// ============================================

function navScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + screenName);
    if(target) target.classList.add('active');
    
    // Close sidebar if open
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

function closePopup() {
    document.getElementById('trade-popup').classList.remove('show');
}

function switchAuthTab(tab) {
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
    
    // Simple Tab Styling Toggle
    if(tab === 'login') {
        document.getElementById('login-tab').classList.add('text-black', 'bg-yellow-400');
        document.getElementById('signup-tab').classList.remove('text-black', 'bg-yellow-400');
    } else {
        document.getElementById('signup-tab').classList.add('text-black', 'bg-yellow-400');
        document.getElementById('login-tab').classList.remove('text-black', 'bg-yellow-400');
    }
}

function playSound(type) {
    const audio = new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.connect(gain);
    gain.connect(audio.destination);
    
    if (type === 'success') {
        osc.frequency.value = 800;
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
    } else if (type === 'tick') {
        osc.frequency.value = 300;
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1);
    } else {
        osc.frequency.value = 200; // Error/Alert
        osc.type = 'sawtooth';
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
    }
    
    osc.start();
    osc.stop(audio.currentTime + 0.5);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Check Status
    const now = new Date();
    const hour = now.getHours();
    const isMarket = hour >= CONFIG.MARKET_OPEN && hour < CONFIG.MARKET_CLOSE;
    const statusEl = document.getElementById('header-status');
    
    if(statusEl) {
        statusEl.innerHTML = isMarket ? '🟢 LIVE MARKET' : '🔴 MARKET CLOSED';
        statusEl.className = isMarket ? 'text-[9px] text-green-400 font-bold' : 'text-[9px] text-red-400 font-bold';
    }
});
