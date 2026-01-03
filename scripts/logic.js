// VELOX PRO LOGIC CORE v6.0

// 1. AUTHENTICATION
function switchAuth(type) {
    if(type === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('tab-login').classList.add('bg-yellow-400', 'text-black');
        document.getElementById('tab-signup').classList.remove('bg-yellow-400', 'text-black');
    } else {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('tab-signup').classList.add('bg-yellow-400', 'text-black');
        document.getElementById('tab-login').classList.remove('bg-yellow-400', 'text-black');
    }
}

function handleLogin() {
    document.getElementById('auth-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        startRealTimeData(); // Start Live Data
    }, 500);
}

// 2. SIDEBAR & MODALS
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('sidebar-open');
}

function openModal(id) {
    document.getElementById(id).classList.add('modal-open');
    toggleSidebar(); // Close sidebar if open
}

function closeModal(id) {
    document.getElementById(id).classList.remove('modal-open');
}

// 3. TABS
function switchTab(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active-panel');
        p.style.opacity = '0';
    });
    const target = document.getElementById('tab-' + tabId);
    target.classList.add('active-panel');
    setTimeout(() => target.style.opacity = '1', 50);

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('text-yellow-400', 'active');
        b.classList.add('text-gray-500');
    });
    event.currentTarget.classList.add('text-yellow-400', 'active');
    event.currentTarget.classList.remove('text-gray-500');
}

// 4. REAL-TIME MARKET SIMULATION (Looks 100% Real)
function startRealTimeData() {
    // Starting Prices (Current Market Levels)
    let nifty = 24150.00;
    let banknifty = 52300.00;

    setInterval(() => {
        // Random Tick Movement (-5 to +5 points)
        let moveNifty = (Math.random() - 0.45) * 5;
        let moveBn = (Math.random() - 0.45) * 12;

        nifty += moveNifty;
        banknifty += moveBn;

        // Update UI
        document.getElementById('price-nifty').innerText = nifty.toFixed(2);
        document.getElementById('price-bn').innerText = banknifty.toFixed(2);

        // Color Flashing
        updateColor('price-nifty', moveNifty);
        updateColor('price-bn', moveBn);
    }, 1000);
}

function updateColor(id, change) {
    const el = document.getElementById(id);
    el.style.color = change >= 0 ? '#4ade80' : '#f87171'; // Green/Red
    setTimeout(() => el.style.color = 'white', 500);
}
