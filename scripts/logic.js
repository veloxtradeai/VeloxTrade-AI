// VELOX PRO LOGIC CORE v4.0

// 1. AUTHENTICATION LOGIC
function toggleAuthMode() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
}

function handleAuth(type) {
    // Basic validation simulation
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> PROCESSING...';

    setTimeout(() => {
        document.getElementById('auth-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            document.getElementById('app-container').classList.add('slide-in');
        }, 500);
    }, 1500);
}

// 2. NAVIGATION & TABS
function switchTab(tabId) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(el => {
        el.classList.remove('active-panel');
        el.style.opacity = '0';
    });
    
    // Show clicked panel
    const target = document.getElementById('tab-' + tabId);
    target.classList.add('active-panel');
    setTimeout(() => target.style.opacity = '1', 50);

    // Update Bottom Nav Colors
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-emerald-400');
        btn.classList.add('text-slate-500');
    });
    event.currentTarget.classList.remove('text-slate-500');
    event.currentTarget.classList.add('text-emerald-400');
}

// 3. PROFILE SIDEBAR
function openProfile() {
    const sidebar = document.getElementById('profile-sidebar');
    sidebar.classList.remove('-translate-x-full');
}

function closeProfile() {
    const sidebar = document.getElementById('profile-sidebar');
    sidebar.classList.add('-translate-x-full');
}

// 4. SETTINGS MODAL
function openSettings(category) {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
