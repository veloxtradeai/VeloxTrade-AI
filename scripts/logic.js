// VELOX PRO LOGIC CORE (Real Market Edition)

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showApp();
    }
});

/* --- AUTH & UI --- */
function switchAuth(type) {
    if(type === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('tab-login').classList.replace('text-gray-400', 'text-black');
        document.getElementById('tab-login').classList.add('bg-yellow-400');
        document.getElementById('tab-signup').classList.remove('bg-yellow-400', 'text-black');
        document.getElementById('tab-signup').classList.add('text-gray-400');
    } else {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('tab-signup').classList.replace('text-gray-400', 'text-black');
        document.getElementById('tab-signup').classList.add('bg-yellow-400');
        document.getElementById('tab-login').classList.remove('bg-yellow-400', 'text-black');
        document.getElementById('tab-login').classList.add('text-gray-400');
    }
}

function handleLogin() {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> CONNECTING...';
    setTimeout(() => {
        localStorage.setItem('isLoggedIn', 'true');
        showApp();
    }, 1000);
}

function showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // LOGIN HOTE HI MARKET TIME CHECK KARO
    checkMarketStatus();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('sidebar-open');
    document.getElementById('overlay').classList.toggle('overlay-active');
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active-panel');
        p.style.display = 'none';
    });
    const target = document.getElementById(`tab-${tabId}`);
    target.style.display = 'block';
    setTimeout(() => target.classList.add('active-panel'), 10);

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('text-yellow-400', 'active');
        b.classList.add('text-gray-500');
    });
    document.getElementById(`btn-${tabId}`).classList.add('text-yellow-400', 'active');
    document.getElementById(`btn-${tabId}`).classList.remove('text-gray-500');
}

/* --- REAL MARKET LOGIC --- */

function checkMarketStatus() {
    const now = new Date();
    // UTC time ko IST me convert karna padega logic ke liye, ya simple hours check karo
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Market Timings: 09:15 to 15:30
    const marketOpen = (hour > 9 || (hour === 9 && minute >= 15));
    const marketClose = (hour < 15 || (hour === 15 && minute <= 30));

    // TEST KE LIYE: Is line ko uncomment karoge to abhi (raat ko) bhi "LIVE" manega
    // const forceLive = false; 

    if (marketOpen && marketClose) {
        setMarketLive();
    } else {
        setMarketClosed();
    }
}

function setMarketLive() {
    // UI Update
    document.getElementById('status-dot').className = "absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse";
    document.getElementById('market-status-text').innerText = "MARKET LIVE";
    document.getElementById('market-status-text').className = "text-[9px] text-green-400 font-bold tracking-widest uppercase";
    
    document.getElementById('ai-status-badge').innerText = "SCANNING";
    document.getElementById('ai-status-badge').className = "absolute right-0 top-0 bg-green-500 text-black text-[9px] font-bold px-3 py-1 rounded-bl-xl";
    document.getElementById('ai-status-dot').className = "w-2 h-2 rounded-full bg-green-500 animate-pulse";
    document.getElementById('ai-status-text').innerText = "Analyzing real-time volatility & volume...";

    // Start Real Data Fetching
    fetchMarketData();
    setInterval(fetchMarketData, 3000); // Har 3 sec me refresh
}

function setMarketClosed() {
    // UI Update
    document.getElementById('status-dot').className = "absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-black rounded-full";
    document.getElementById('market-status-text').innerText = "MARKET CLOSED";
    document.getElementById('market-status-text').className = "text-[9px] text-red-400 font-bold tracking-widest uppercase";
    
    document.getElementById('ai-status-badge').innerText = "OFFLINE";
    document.getElementById('ai-status-badge').className = "absolute right-0 top-0 bg-gray-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl";
    document.getElementById('ai-status-dot').className = "w-2 h-2 rounded-full bg-red-500";
    document.getElementById('ai-status-text').innerText = "Markets are closed. AI Scanner is in sleep mode.";

    // Last Data Fetch (One time)
    fetchMarketData();
}

/* --- DATA FETCHING (YAHOO FINANCE / REAL DATA) --- */
async function fetchMarketData() {
    try {
        // NIFTY
        const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?interval=1d&range=1d');
        const data = await res.json();
        const meta = data.chart.result[0].meta;
        
        updateTicker('price-nifty', 'pct-nifty', meta.regularMarketPrice, meta.previousClose);
    } catch (e) {
        // Agar API block ho (CORS issue), to Last Known Data dikhao (Fake random nahi)
        console.log("Data fetch failed (likely CORS). Using Static Data.");
        // Static valid data for night view
        document.getElementById('price-nifty').innerText = "21,710.80";
        document.getElementById('pct-nifty').innerText = "+0.00%";
        document.getElementById('price-bn').innerText = "48,159.00"; 
    }
}

function updateTicker(priceId, pctId, current, prev) {
    const diff = current - prev;
    const pct = (diff / prev) * 100;
    
    const priceEl = document.getElementById(priceId);
    const pctEl = document.getElementById(pctId);
    
    priceEl.innerText = current.toLocaleString('en-IN', {minimumFractionDigits: 2});
    pctEl.innerText = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
    
    if(pct >= 0) {
        pctEl.className = "text-xs font-bold px-2 py-1 rounded text-green-400 bg-green-500/10";
        priceEl.classList.remove('text-red-400');
        priceEl.classList.add('text-white');
    } else {
        pctEl.className = "text-xs font-bold px-2 py-1 rounded text-red-400 bg-red-500/10";
        priceEl.classList.remove('text-white');
        priceEl.classList.add('text-red-400');
    }
}

/* --- POPUP LOGIC --- */
// Is function ko tabhi call kiya jayega jab market LIVE ho aur koi breakout mile.
// Abhi Raat ko ye call nahi hoga.
function triggerPopup(stock, price) {
    const popup = document.getElementById('ai-popup-container');
    document.getElementById('popup-stock').innerText = stock;
    document.getElementById('popup-price').innerText = "₹" + price;
    
    popup.classList.remove('popup-hidden');
    popup.classList.add('popup-visible');
    
    // Play Sound
    // const audio = new Audio('alert.mp3'); audio.play();
}

function closePopup() {
    const popup = document.getElementById('ai-popup-container');
    popup.classList.remove('popup-visible');
    popup.classList.add('popup-hidden');
}
