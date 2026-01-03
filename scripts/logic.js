// VELOXTRADE ULTIMATE LOGIC v5.0

// 1. AUTH & INIT
function switchAuth(type) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('tab-login').classList.remove('bg-yellow-400', 'text-black');
    document.getElementById('tab-login').classList.add('text-gray-400');
    document.getElementById('tab-signup').classList.remove('bg-yellow-400', 'text-black');
    document.getElementById('tab-signup').classList.add('text-gray-400');

    if(type === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('tab-login').classList.add('bg-yellow-400', 'text-black');
        document.getElementById('tab-login').classList.remove('text-gray-400');
    } else {
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('tab-signup').classList.add('bg-yellow-400', 'text-black');
        document.getElementById('tab-signup').classList.remove('text-gray-400');
    }
}

function handleLogin() {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> AUTHENTICATING...';
    
    setTimeout(() => {
        document.getElementById('auth-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            startMarketSimulation(); // Start the AI Brain
        }, 500);
    }, 1500);
}

// 2. NAVIGATION
function switchTab(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active-panel');
        p.style.opacity = '0';
    });
    const target = document.getElementById('tab-' + tabId);
    target.classList.add('active-panel');
    setTimeout(() => target.style.opacity = '1', 50);

    // Update Nav Icons
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('text-yellow-400', 'active');
        b.classList.add('text-gray-500');
    });
    event.currentTarget.classList.add('text-yellow-400', 'active');
    event.currentTarget.classList.remove('text-gray-500');
}

// 3. AI MARKET SCANNER (The Killer Feature)
function startMarketSimulation() {
    console.log("AI Scanner Started...");
    
    // Simulate finding a trade after 5 seconds
    setTimeout(() => {
        triggerPopupSignal();
    }, 5000);
}

function triggerPopupSignal() {
    // 1. Play Sound (Simulated via console/vibrate)
    if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
    console.log("Ringing Bell...");

    // 2. Show Popup
    const popup = document.getElementById('magic-popup');
    popup.classList.remove('hidden');
    popup.classList.add('flex');
}

function closePopup() {
    document.getElementById('magic-popup').classList.add('hidden');
    document.getElementById('magic-popup').classList.remove('flex');
}

// 4. ONE-CLICK EXECUTION
let activePositions = [];

function executePopupTrade() {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> SENDING ORDER...';
    
    setTimeout(() => {
        // Close Popup
        closePopup();
        btn.innerHTML = '<i class="fas fa-bolt"></i> ONE-CLICK BUY';
        
        // Add to Portfolio
        const newTrade = {
            symbol: "BANKNIFTY 48200 CE",
            avg: 320.00,
            ltp: 320.00,
            pnl: 0
        };
        activePositions.push(newTrade);
        updatePortfolioUI();
        
        // Switch to Portfolio Tab
        document.querySelector('button[onclick="switchTab(\'portfolio\')"]').click();
        
        // Alert
        alert("Order Executed via Zerodha! Trade is Live.");
    }, 1500);
}

// 5. PORTFOLIO & PNL UPDATE
function updatePortfolioUI() {
    const container = document.getElementById('positions-container');
    container.innerHTML = '';
    
    let totalPnL = 0;

    activePositions.forEach(trade => {
        // Random PnL movement
        const move = (Math.random() - 0.45) * 5;
        trade.ltp += move;
        trade.pnl = (trade.ltp - trade.avg) * 15; // 15 Qty
        totalPnL += trade.pnl;

        const color = trade.pnl >= 0 ? 'text-green-400' : 'text-red-400';
        
        const html = `
        <div class="velox-card p-4 border-l-4 ${trade.pnl >= 0 ? 'border-green-500' : 'border-red-500'}">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-white text-sm">${trade.symbol}</h4>
                    <p class="text-[10px] text-gray-400">Buy: ${trade.avg.toFixed(2)} • LTP: ${trade.ltp.toFixed(2)}</p>
                </div>
                <div class="text-right">
                    <p class="text-lg font-black ${color}">${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}</p>
                    <span class="text-[9px] bg-blue-900 text-blue-300 px-1 rounded">MIS</span>
                </div>
            </div>
        </div>`;
        container.innerHTML += html;
    });

    const pnlEl = document.getElementById('total-pnl');
    pnlEl.innerText = `₹${totalPnL.toFixed(2)}`;
    pnlEl.className = `text-4xl font-black mt-2 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`;

    // Loop
    setTimeout(updatePortfolioUI, 1000);
}

// 6. BROKER CONNECTION
function connectBroker() {
    const btn = document.getElementById('btn-broker');
    const select = document.getElementById('broker-select').value;
    
    btn.innerHTML = '<i class="fas fa-sync fa-spin"></i> VERIFYING API...';
    setTimeout(() => {
        btn.innerHTML = `<i class="fas fa-check-circle"></i> ${select.toUpperCase()} CONNECTED`;
        btn.className = "w-full py-3 bg-green-600 text-white rounded-xl font-bold text-xs tracking-widest";
        alert(`${select} linked successfully! Auto-trading enabled.`);
    }, 2000);
}
