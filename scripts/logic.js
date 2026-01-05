// Location: scripts/logic.js

// 1. LOGIN SYSTEM
function handleLogin() {
    const id = document.getElementById('login-id').value;
    const pass = document.getElementById('login-pass').value;

    if(id && pass) {
        // Animation effect
        const btn = document.querySelector('.btn-gold');
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> CONNECTING...';
        
        setTimeout(() => {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            initializeMarket(); // Start the fake market connection
        }, 1500);
    } else {
        alert("Please enter User ID and Password");
    }
}

// 2. NAVIGATION SYSTEM
function switchTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active-panel');
    });
    
    // Show selected
    document.getElementById('tab-' + tabName).classList.add('active-panel');

    // Update Bottom Nav Styling
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-yellow-400');
        btn.classList.add('text-gray-400');
    });
    // Highlight active logic would go here based on clicked element, 
    // but for simplicity handled by inline onclicks updating styles in real app frameworks.
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar.classList.contains('sidebar-open')) {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('overlay-active');
    } else {
        sidebar.classList.add('sidebar-open');
        overlay.classList.add('overlay-active');
    }
}

function logout() {
    if(confirm("Are you sure you want to logout?")) {
        location.reload();
    }
}

// 3. SCREENER & POPUP LOGIC
function startScanner() {
    const btn = document.getElementById('btn-scan');
    const anim = document.getElementById('scan-animation');
    
    btn.classList.add('hidden');
    anim.classList.remove('hidden');

    // Simulate finding a trade after 3 seconds
    setTimeout(() => {
        triggerPopup("TATASTEEL", "145.50", "142.00", "152.00");
        
        // Reset Scanner button
        btn.classList.remove('hidden');
        anim.classList.add('hidden');
        btn.innerText = "RE-SCAN MARKET";
    }, 3000);
}

function triggerPopup(stock, entry, sl, tgt) {
    // 1. Set Data
    document.getElementById('popup-stock').innerText = stock;
    document.getElementById('popup-entry').innerText = entry;
    document.getElementById('popup-sl').innerText = sl;
    document.getElementById('popup-tgt').innerText = tgt;

    // 2. Play Sound
    const audio = document.getElementById('alert-sound');
    audio.play().catch(e => console.log("Audio permission needed"));

    // 3. Show Popup
    document.getElementById('trade-popup').classList.add('popup-active');

    // 4. Vibration (Mobile only)
    if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function closePopup() {
    document.getElementById('trade-popup').classList.remove('popup-active');
}

// 4. MARKET STATUS SIMULATION
function initializeMarket() {
    const statusText = document.getElementById('market-status-text');
    const indicator = document.getElementById('market-indicator');
    
    setTimeout(() => {
        statusText.innerText = "MARKET LIVE";
        statusText.classList.remove('text-gray-400');
        statusText.classList.add('text-green-400');
        
        indicator.classList.remove('bg-gray-500');
        indicator.classList.add('bg-green-500');
        indicator.classList.add('live-dot'); // Blinking effect
    }, 2000);
}
