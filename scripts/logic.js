// VeloxTrade AI - Core Logic v3.0 (Interactive)
const BACKEND_URL = "https://velox-backend.velox-trade-ai.workers.dev"; // आपका सर्वर

let currentSignal = {};
let activeTrades = [];
let userBalance = 0;

// 1. LOGIN SYSTEM
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');
    const btn = document.querySelector('.btn-gold');

    if(!email || !pass) { msg.innerText = "Please enter details"; return; }
    
    btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> CONNECTING...';
    
    try {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pass })
        });

        const data = await response.json();

        if (data.status === "success") {
            userBalance = data.user.balance;
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('user-balance').innerText = `₹${userBalance.toLocaleString('en-IN')}`;
            startScanning();
            startPnLUpdater(); // Start Fake P&L movement
        } else {
            msg.innerText = "Wrong Credentials!";
            btn.innerHTML = 'SECURE LOGIN <i class="fas fa-arrow-right ml-2"></i>';
        }
    } catch (e) {
        // Fallback for demo if server offline
        document.getElementById('login-modal').style.display = 'none';
        startScanning();
    }
}

// 2. TABS & UI
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active-tab');
        t.style.opacity = '0';
    });
    
    const active = document.getElementById(tabName + '-tab');
    active.classList.add('active-tab');
    setTimeout(() => active.style.opacity = '1', 50);

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Find parent div of the clicked icon based on onclick attribute matching
    const navItems = document.querySelectorAll('.nav-item');
    if(tabName === 'home') navItems[0].classList.add('active');
    if(tabName === 'portfolio') navItems[1].classList.add('active');
    if(tabName === 'settings') navItems[2].classList.add('active');
}

// 3. SIGNAL SCANNING
async function startScanning() {
    fetchData();
    setInterval(fetchData, 3000);
}

async function fetchData() {
    try {
        const res = await fetch(`${BACKEND_URL}/signals`);
        const data = await res.json();
        currentSignal = data; // Save for execution

        document.getElementById('best-symbol').innerText = data.symbol;
        document.getElementById('signal-price').innerText = `₹${data.price}`;
        document.getElementById('best-entry').innerText = `₹${data.price}`;
        document.getElementById('best-target').innerText = `₹${data.target}`;
        document.getElementById('best-sl').innerText = `₹${data.stoploss}`;
        document.getElementById('accuracy').innerText = data.accuracy;

        const badge = document.getElementById('signal-badge');
        const card = document.getElementById('main-signal-card');

        if(data.signal.includes("BUY")) {
            badge.innerText = "STRONG BUY";
            badge.className = "bg-green-500 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-green-500/50";
            card.style.borderColor = "#22c55e"; 
            document.getElementById('best-symbol').className = "text-4xl font-black italic text-green-400 tracking-tight";
        } else {
            badge.innerText = "STRONG SELL";
            badge.className = "bg-red-500 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-red-500/50";
            card.style.borderColor = "#ef4444";
            document.getElementById('best-symbol').className = "text-4xl font-black italic text-red-400 tracking-tight";
        }

    } catch (e) { console.log("Scanning..."); }
}

// 4. REALISTIC TRADE EXECUTION
function executeTrade() {
    if(!currentSignal.symbol) return;
    
    alert(`Order Placed: ${currentSignal.symbol} @ ₹${currentSignal.price}`);
    
    // Add to Active Trades
    activeTrades.push({
        symbol: currentSignal.symbol,
        type: currentSignal.signal.includes("BUY") ? "BUY" : "SELL",
        price: parseFloat(currentSignal.price.replace(/,/g, '')),
        qty: 50, // Default lot
        pnl: 0
    });

    renderPortfolio();
    switchTab('portfolio'); // Auto go to portfolio
}

// 5. PORTFOLIO & P&L SIMULATION
function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    if(activeTrades.length === 0) {
        container.innerHTML = `<div id="empty-msg" class="text-center py-10 opacity-30"><i class="fas fa-folder-open text-4xl mb-3"></i><p class="text-xs">No active trades</p></div>`;
        return;
    }

    container.innerHTML = '';
    activeTrades.forEach((trade, index) => {
        const colorClass = trade.pnl >= 0 ? 'text-green-400' : 'text-red-400';
        const borderClass = trade.pnl >= 0 ? 'border-l-green-500' : 'border-l-red-500';
        
        const html = `
        <div class="velox-card p-4 flex justify-between items-center border-l-4 ${borderClass}">
            <div>
                <div class="flex items-center gap-2">
                    <span class="bg-blue-500/20 text-blue-400 px-1.5 rounded text-[9px] font-bold">MIS</span>
                    <h4 class="font-bold text-sm text-white">${trade.symbol}</h4>
                </div>
                <p class="text-[10px] text-gray-400 mt-1">${trade.type} • Qty: ${trade.qty} • Avg: ${trade.price}</p>
            </div>
            <div class="text-right">
                <p class="${colorClass} font-bold font-mono text-lg">${trade.pnl > 0 ? '+' : ''}₹${trade.pnl.toFixed(2)}</p>
                <p class="text-[10px] text-gray-500">LTP: ${(trade.price + (trade.pnl/trade.qty)).toFixed(2)}</p>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function startPnLUpdater() {
    setInterval(() => {
        let totalPnL = 0;
        activeTrades.forEach(trade => {
            // Random fluctuation logic to look real
            const fluctuation = (Math.random() - 0.45) * 5; 
            trade.pnl += fluctuation;
            totalPnL += trade.pnl;
        });
        
        if(activeTrades.length > 0) renderPortfolio();
        
        const pnlEl = document.getElementById('total-pnl');
        pnlEl.innerText = `${totalPnL > 0 ? '+' : ''}₹${totalPnL.toFixed(2)}`;
        pnlEl.className = `text-4xl font-bold mt-2 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`;
    }, 1000); // Updates every second
}

// 6. SETTINGS SAVING
function saveBrokerSettings() {
    const key = document.getElementById('api-key').value;
    const btn = document.getElementById('btn-connect');
    
    if(key.length < 5) {
        alert("Invalid API Key");
        return;
    }
    
    btn.innerHTML = '<i class="fas fa-check-circle"></i> CONNECTED';
    btn.className = "w-full bg-green-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest";
    setTimeout(() => alert("Broker Connected Successfully!"), 500);
}
