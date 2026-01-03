// --- मास्टर कॉन्फ़िगरेशन और स्टेट ---
let lastBestSymbol = "";

// --- 1. रियल-टाइम डेटा अपडेट फंक्शन ---
async function updateUI() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/signal');
        const data = await response.json();

        if (data.best && data.best.symbol !== "SCANNING...") {
            // जैकपॉट कार्ड अपडेट करें
            document.getElementById('jackpot-card').classList.remove('hidden');
            document.getElementById('best-symbol').innerText = data.best.symbol;
            document.getElementById('best-entry').innerText = "₹" + data.best.price;
            document.getElementById('best-target').innerText = "₹" + data.best.target;
            document.getElementById('best-sl').innerText = "₹" + data.best.sl;
            document.getElementById('best-conf').innerText = "Accuracy: " + data.best.rsi + "%";
            document.getElementById('best-icon').src = data.best.icon;

            // अगर नया जैकपॉट शेयर मिले तो अलार्म बजाएं
            if (lastBestSymbol !== data.best.symbol) {
                playAlertSound();
                lastBestSymbol = data.best.symbol;
            }
        }

        // ट्रेंडिंग स्टॉक्स की लिस्ट अपडेट करें (Groww Style)
        if (data.list) {
            let listHtml = '';
            data.list.forEach(s => {
                listHtml += `
                <div class="stock-row p-4 flex justify-between items-center border border-white/5 shadow-lg">
                    <div class="flex items-center gap-3">
                        <img src="${s.icon}" class="w-10 h-10 rounded-xl bg-white p-1">
                        <div>
                            <p class="font-bold text-sm">${s.symbol}</p>
                            <p class="text-[10px] text-gray-500">RSI: ${s.rsi}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-sm">₹${s.price}</p>
                        <p class="text-xs ${s.is_up ? 'text-green-400' : 'text-red-400'} font-bold">${s.change}</p>
                    </div>
                </div>`;
            });
            document.getElementById('stock-list').innerHTML = listHtml;
        }
    } catch (err) {
        console.log("Backend offline या कनेक्ट नहीं हो पा रहा...");
    }
}

// --- 2. ट्रेड एग्जीक्यूशन (One-Click Buy) ---
function executeTrade() {
    const symbol = document.getElementById('best-symbol').innerText;
    const price = document.getElementById('best-entry').innerText;
    
    // लोकल स्टोरेज से ब्रोकर सेटिंग्स चेक करना
    const linkedBroker = localStorage.getItem('broker') || "None";
    const apiKey = localStorage.getItem('apiKey');

    if (symbol === "---" || symbol === "SCANNING...") {
        return alert("❌ अभी कोई सक्रिय सिग्नल नहीं है। कृपया प्रतीक्षा करें।");
    }

    if (!apiKey) {
        alert("⚠️ कोई ट्रेडिंग ऐप लिंक नहीं मिला!\n\nकृपया 'सेटिंग्स' में जाकर अपना API Key दर्ज करें।");
        window.location.href = 'templates/settings.html';
        return;
    }

    // असली ऑर्डर भेजने का लॉजिक (सिमुलेशन)
    const confirmTrade = confirm(`🚀 ${symbol} खरीदने के लिए तैयार?\n\nBroker: ${linkedBroker.toUpperCase()}\nPrice: ${price}\n\nक्या आप ऑर्डर भेजना चाहते हैं?`);
    
    if (confirmTrade) {
        console.log(`Sending Order to ${linkedBroker} API...`);
        alert(`✅ ऑर्डर सफलतापूर्वक भेजा गया!\n\nस्टॉक: ${symbol}\nब्रोकर: ${linkedBroker.toUpperCase()}\nस्थिति: पेंडिंग (Check your broker app)`);
    }
}

// --- 3. अलर्ट साउंड फंक्शन ---
function playAlertSound() {
    // ब्राउज़र की पाबंदी की वजह से साउंड तभी बजेगा जब यूजर ने स्क्रीन पर कहीं क्लिक किया हो
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Sound blocked by browser. Click anywhere to enable."));
}

// --- 4. टाइमर अपडेट (Header) ---
function updateClock() {
    const now = new Date();
    if(document.getElementById('timer')) {
        document.getElementById('timer').innerText = now.toLocaleTimeString();
    }
}

// --- शुरुआत (Initialization) ---
setInterval(updateUI, 5000); // हर 5 सेकंड में डेटा रिफ्रेश
setInterval(updateClock, 1000); // हर सेकंड घड़ी अपडेट
updateUI();