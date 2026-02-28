// ==========================================
// 1. CẤU HÌNH & BIẾN TOÀN CỤC
// ==========================================
// THAY LINK GOOGLE SCRIPT MỚI NHẤT CỦA BẠN VÀO ĐÂY (NẾU CÓ DEPLOY LẠI)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPF-6htdt3s_ANFly1PmRYe6w7de3u4aExNXbA8QIHvUfgM6EbZPzNsIjMdKLw4zGp/exec'; 
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6YfzmkVPwief31DVP7UnzWS6Wz-wiAOlrvr0fkHbMpgq8lw/viewform'; 
let currentStage = 0; 
let userName = "Chị";

let currentUser = {
    phone: '',
    name: '',
    initialMood: 0,
    dragonBreaths: 0,   // Đếm nhịp thở rồng
    painAreas: '',      // Lưu vùng đau
    eval1: 5,           // Đánh giá 1
    eval2: 5,           // Đánh giá 2
    usefulness: '',     // Sự hữu ích (đánh giá từng stage)
    capybaraMood: '',
    cloudThought: '',
    jarNote: '',
    finalMood: 0
};

// Background gradient cho từng màn hình
const stageBackgrounds = {
    0: "linear-gradient(to bottom, #fffde7, #ffffff)",
    1: "linear-gradient(to bottom, #a5d6a7, #e8f5e9)",
    2: "linear-gradient(to bottom, #e0f7fa, #e0f7fa)",
    'pain-map': "linear-gradient(to bottom, #ffebee, #ffcdd2)", 
    3: "linear-gradient(to bottom, #e0f2f1, #b2dfdb)",
    4: "linear-gradient(to bottom, #fff9c4, #fff176)",
    5: "linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)",
    6: "linear-gradient(to top, #fce4ec, #f8bbd0)",
    'eval-1': "linear-gradient(to bottom, #e0f7fa, #b2ebf2)",
    'eval-2': "linear-gradient(to bottom, #e0f7fa, #b2ebf2)",
    'usefulness': "linear-gradient(to bottom, #e8f5e9, #c8e6c9)",
    7: "linear-gradient(to top, #fce4ec, #f8bbd0)"
};

// ==========================================
// 2. ĐĂNG NHẬP & BẮT ĐẦU
// ==========================================
function checkPhone() {
    const phoneInput = document.getElementById('input-phone');
    const val = phoneInput.value.trim();
    
    if (!val || val.length < 9) { 
        alert("Vui lòng nhập số điện thoại hợp lệ ạ!"); 
        return; 
    }
    
    // Kiểm tra lối vào Admin
    if (val === "0967791552") { 
        openAdminPanel(); 
        return; 
    }

    currentUser.phone = val;
    const stored = localStorage.getItem('user_' + val);
    
    if (stored) {
        const data = JSON.parse(stored); 
        currentUser.name = data.name; 
        userName = data.name;
        document.getElementById('step-phone').style.display = 'none';
        document.getElementById('step-welcome-back').style.display = 'block';
        document.getElementById('welcome-message').innerHTML = `Chào mừng chị <b>${userName}</b> đã quay lại!`;
    } else {
        document.getElementById('step-phone').style.display = 'none';
        document.getElementById('step-name').style.display = 'block';
    }
}

function registerAndStart() {
    const nameInput = document.getElementById('input-name').value.trim();
    if (!nameInput) { alert("Chị ơi, hãy nhập tên nhé!"); return; }
    
    currentUser.name = nameInput; 
    userName = nameInput;
    localStorage.setItem('user_' + currentUser.phone, JSON.stringify(currentUser));
    startGameDirectly();
}

function startGameDirectly() {
    const modal = document.getElementById('welcome-modal');
    modal.style.transition = "opacity 0.5s";
    modal.style.opacity = "0";
    
    setTimeout(() => {
        modal.style.display = 'none'; 
        document.getElementById('stage-0').style.display = 'none';
        document.getElementById('stage-0').classList.remove('active');

        const emotionStage = document.getElementById('stage-emotion-check');
        emotionStage.style.display = 'flex'; // Ép căn giữa
        emotionStage.classList.add('active');
        
        // Reset giao diện cảm xúc
        updateEmotionDisplay();
    }, 500);
}

// ==========================================
// 3. XỬ LÝ CẢM XÚC (ĐẦU VÀ CUỐI)
// ==========================================
const emotionLevels = {
    1: { text: "Tuyệt vọng", emoji: "😭", color: "#1a237e" },  
    2: { text: "Rất tồi tệ", emoji: "😫", color: "#4a148c" },  
    3: { text: "Tồi tệ", emoji: "😠", color: "#b71c1c" },      
    4: { text: "Kém", emoji: "☹️", color: "#e53935" },         
    5: { text: "Bình thường (Ổn)", emoji: "😐", color: "#f57f17" }, 
    6: { text: "Tương đối tốt", emoji: "🙂", color: "#fbc02d" },    
    7: { text: "Tốt", emoji: "😊", color: "#fdd835" },              
    8: { text: "Rất tốt", emoji: "😁", color: "#c0ca33" },          
    9: { text: "Tuyệt vời", emoji: "😄", color: "#66bb6a" },        
    10: { text: "Rất tuyệt vời", emoji: "🤩", color: "#00c853" }    
};

function updateEmotionDisplay() {
    const slider = document.getElementById('emotion-range');
    if(!slider) return;
    const val = parseInt(slider.value); 
    const data = emotionLevels[val];
    
    document.getElementById('current-emoji').innerText = data.emoji;
    document.getElementById('current-status').innerText = `${val} - ${data.text}`;
    document.getElementById('current-status').style.color = data.color;
    
    if(navigator.vibrate) navigator.vibrate(5);
}

function submitInitialEmotion() {
    const slider = document.getElementById('emotion-range');
    if (slider) {
        const val = parseInt(slider.value);
        currentUser.initialMood = emotionLevels[val] ? emotionLevels[val].text : val;
        localStorage.setItem('user_' + currentUser.phone, JSON.stringify(currentUser));
    }
    switchStage(1);
}

function updateFinalEmotionDisplay() {
    const slider = document.getElementById('final-range'); 
    if (!slider) return; 
    
    const val = parseInt(slider.value); 
    const data = emotionLevels[val];
    const emojiEl = document.getElementById('final-emoji'); 
    const statusEl = document.getElementById('final-status');
    
    if (emojiEl) emojiEl.innerText = data.emoji;
    if (statusEl) { 
        statusEl.innerText = `${val} - ${data.text}`; 
        statusEl.style.color = data.color; 
    }
    
    if(navigator.vibrate) navigator.vibrate(5);
}

// ==========================================
// 4. CHUYỂN TRANG (ROUTER ĐÃ TỐI ƯU CĂN GIỮA)
// ==========================================
function switchStage(stageNum) {
    console.log("Chuyển đến màn hình:", stageNum);
    
    if(typeof launchFireworks === 'function') launchFireworks();
    
    // Gỡ class active và ẩn tất cả các màn hình
    document.querySelectorAll('.stage').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });
    
    // Xử lý nút Back và Màu nền
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.style.display = (stageNum === 0) ? 'none' : 'block';
    if (stageBackgrounds[stageNum]) document.body.style.background = stageBackgrounds[stageNum];

    // Khởi tạo các hàm đặc thù của từng màn hình
    if (stageNum === 1) resetStage1();
    if (stageNum === 2) initDragon();
    if (stageNum === 'pain-map') initPainMap();
    if (stageNum === 'usefulness') initUsefulnessEval();
    if (stageNum === 3) initBodyScan();
    if (stageNum === 5) { setTimeout(() => { const input = document.getElementById('thoughtInput'); if(input) input.focus(); }, 500); }
    if (stageNum === 6) {
        const btn = document.getElementById('connect-btn-s6');
        if(btn) { 
            btn.style.opacity = '0'; btn.style.pointerEvents = 'none'; 
            setTimeout(() => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }, 5000); 
        }
    }

    // HIỂN THỊ MÀN HÌNH MỚI (Bắt buộc dùng flex để căn giữa)
    const newStage = document.getElementById(`stage-${stageNum}`);
    if (newStage) {
        newStage.style.display = 'flex'; 
        setTimeout(() => { newStage.classList.add('active'); }, 10);
        currentStage = stageNum;
    }
}

// ==========================================
// 5. HIỆU ỨNG PHÁO HOA
// ==========================================
const canvas = document.getElementById('fireworks-canvas'); 
const ctx = canvas.getContext('2d'); 
let particles = [];

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); 
resizeCanvas();

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color; 
        this.radius = Math.random() * 3 + 1;
        this.velocity = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 }; 
        this.alpha = 1; this.friction = 0.95;
    }
    draw() { 
        ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); 
        ctx.fillStyle = this.color; ctx.fill(); ctx.restore(); 
    }
    update() { 
        this.velocity.x *= this.friction; this.velocity.y *= this.friction; 
        this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= 0.02; 
    }
}

function launchFireworks() {
    for(let i=0; i<12; i++) {
        const x = Math.random() * canvas.width; 
        const y = Math.random() * canvas.height / 2; 
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        for (let j = 0; j < 50; j++) particles.push(new Particle(x, y, color));
    }
    animateFireworks();
}

function animateFireworks() {
    if(particles.length === 0) { ctx.clearRect(0,0,canvas.width, canvas.height); return; }
    requestAnimationFrame(animateFireworks);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => { 
        if (p.alpha > 0) { p.update(); p.draw(); } else { particles.splice(index, 1); } 
    });
}

// ==========================================
// 6. STAGE 1: KHỈ
// ==========================================
const sceneS1 = document.getElementById('scene-s1'); 
const guideTextS1 = document.getElementById('guide-text-s1');
const countdownDisplay = document.getElementById('countdown-display'); 
const stopBtn = document.getElementById('stop-btn');
const successPanel = document.getElementById('success-panel');

let s1_monkeys = []; let s1_timer = null; let s1_count = 0; let s1_isSuccess = false;

function createMonkeys(amount) {
    for (let i = 0; i < amount; i++) {
        const monkey = document.createElement('div'); 
        monkey.classList.add('monkey', 'running');
        monkey.innerText = Math.random() > 0.5 ? '🐒' : '🙉';
        monkey.style.left = (Math.random() * 90) + '%'; 
        monkey.style.top = (Math.random() * 80) + '%';
        monkey.style.animationDuration = (Math.random() * 1.5 + 1) + 's';
        sceneS1.appendChild(monkey); s1_monkeys.push(monkey);
    }
}

function resetStage1() {
    if(successPanel) successPanel.style.display = 'none'; 
    document.getElementById('top-message-area').innerHTML = ''; 
    document.getElementById('greeting-text').style.opacity = '1'; 
    document.getElementById('monkey-metaphor').style.opacity = '1';
    
    s1_isSuccess = false; clearInterval(s1_timer); 
    countdownDisplay.innerHTML = ''; stopBtn.style.display = 'flex'; 
    guideTextS1.innerText = 'Nhấn giữ chuông để ra lệnh\n"DỪNG LẠI"'; 
    guideTextS1.style.opacity = '1';
    
    s1_monkeys.forEach(m => m.remove()); s1_monkeys = []; 
    createMonkeys(20);
}

function startProcess(e) {
    if (s1_isSuccess) return; 
    if (e.cancelable) e.preventDefault();
    s1_count = 1; 
    guideTextS1.innerText = "Giữ yên..."; guideTextS1.style.opacity = 0.5;
    const metaphor = document.getElementById('monkey-metaphor'); 
    if(metaphor) metaphor.style.opacity = '0';
    
    showNumber(1); 
    s1_monkeys.forEach(m => m.classList.add('vanishing'));
    s1_timer = setInterval(() => { 
        s1_count++; 
        if (s1_count <= 3) { showNumber(s1_count); } 
        else { finishGameS1(); } 
    }, 1000);
}

function showNumber(num) { countdownDisplay.innerHTML = `<div class="count-number">${num}</div>`; }

function cancelProcess() {
    if (s1_isSuccess) return; 
    clearInterval(s1_timer); countdownDisplay.innerHTML = ''; 
    guideTextS1.innerText = 'Nhấn giữ chuông để ra lệnh\n"DỪNG LẠI"'; guideTextS1.style.opacity = 1; s1_count = 0;
    const metaphor = document.getElementById('monkey-metaphor'); 
    if(metaphor) metaphor.style.opacity = '1';
    s1_monkeys.forEach(m => m.classList.remove('vanishing'));
}

function finishGameS1() {
    clearInterval(s1_timer); s1_isSuccess = true; 
    countdownDisplay.innerHTML = '<div class="quiet-text">Tĩnh lặng...</div>';
    const greeting = document.getElementById('greeting-text'); 
    const metaphor = document.getElementById('monkey-metaphor');
    
    if(greeting) greeting.style.opacity = '0'; 
    if(metaphor) metaphor.style.opacity = '0';
    
    s1_monkeys.forEach(m => m.remove()); s1_monkeys = []; 
    setTimeout(() => { 
        countdownDisplay.innerHTML = ''; stopBtn.style.display = 'none'; 
        document.getElementById('top-message-area').innerHTML = `<div class="safe-quote"><span class="glowing-star">✨</span><br>"Dừng lại,<br>mình đang ở đây và an toàn."</div>`;
        setTimeout(() => { if(successPanel) successPanel.style.display = 'flex'; }, 1000);
    }, 3000);
}

// ==========================================
// 7. STAGE 2: RỒNG ĐẾM NHỊP THỞ
// ==========================================
const pinwheel = document.getElementById('pinwheel'); const belly = document.getElementById('belly'); 
const fire = document.getElementById('fire'); const mouth = document.getElementById('mouth'); 
const instructionDragon = document.getElementById('instruction-dragon'); 
const dragonBtn = document.getElementById('interaction-area');

let s2_rotation = 0; let s2_speed = 2; let s2_isHolding = false; 
let s2_energy = 0; let fireTimeout = null; let lastInteractionTime = 0; 

function initDragon() { 
    s2_speed = 2; s2_rotation = 0; s2_energy = 0; s2_isHolding = false; 
    currentUser.dragonBreaths = 0; // Đặt lại nhịp thở
    if(fire) fire.classList.remove("active"); 
    if(belly) belly.classList.remove("inhaling"); 
}

function gameLoopS2() {
    const isBlowing = fire && fire.classList.contains('active');
    if (s2_isHolding) { 
        s2_speed = s2_speed * 0.9; 
        if (s2_speed < 0.1) s2_speed = 0; 
        if (s2_energy < 100) s2_energy += 0.5; 
    } else { 
        if (isBlowing) { 
            s2_speed *= 0.995; if (s2_speed < 8) s2_speed = 8; 
        } else { 
            if (s2_speed > 0) s2_speed *= 0.96; if (s2_speed < 0.1) s2_speed = 0; 
        } 
    }
    s2_rotation += s2_speed; 
    if(pinwheel) pinwheel.style.transform = `rotate(${s2_rotation}deg)`; 
    requestAnimationFrame(gameLoopS2);
}
gameLoopS2();

function startBreath(e) {
    if(e.cancelable && e.type === 'touchstart') e.preventDefault(); 
    if (s2_isHolding) return; 
    
    currentUser.dragonBreaths += 1; // Cộng nhịp thở
    
    s2_isHolding = true; s2_energy = 0; 
    instructionDragon.textContent = "Hít sâu..."; instructionDragon.style.color = "#4caf50"; 
    dragonBtn.textContent = "Đang hít vào..."; 
    belly.classList.add("inhaling"); fire.classList.remove("active"); 
    clearTimeout(fireTimeout); mouth.className = "mouth smile";
}

function releaseBreath(e) {
    const now = Date.now(); if (now - lastInteractionTime < 300) return; lastInteractionTime = now;
    if (!s2_isHolding) return; s2_isHolding = false; 
    
    let boost = 20 + (s2_energy * 1.5); s2_speed = boost; 
    instructionDragon.textContent = "Thở ra ... kéo dài"; instructionDragon.style.color = "#ff5722"; 
    dragonBtn.textContent = "Nhấn giữ để Hít tiếp"; 
    belly.classList.remove("inhaling"); fire.classList.add("active"); mouth.className = "mouth blowing"; 
    
    clearTimeout(fireTimeout); 
    fireTimeout = setTimeout(() => { 
        if (!s2_isHolding) { 
            fire.classList.remove("active"); mouth.className = "mouth smile"; 
            instructionDragon.textContent = "Hít vào..."; instructionDragon.style.color = "#006064"; 
        } 
    }, 2000); 
}

const oldBtn = document.getElementById('interaction-area'); 
if (oldBtn) {
    const newBtn = oldBtn.cloneNode(true); 
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener('mousedown', startBreath); 
    newBtn.addEventListener('touchstart', startBreath, { passive: false });
}
window.removeEventListener('mouseup', releaseBreath); 
window.removeEventListener('touchend', releaseBreath); 
window.addEventListener('mouseup', releaseBreath); 
window.addEventListener('touchend', releaseBreath);

// ==========================================
// 8. STAGE NỖI ĐAU (Đã chia tách Trái/Phải)
// ==========================================
const painAreasConfig = [
    { id: 'head', name: 'Cổ và cơ hàm', points: [{ top: '25%', left: '50%' }], label: { side: 'right', offsetX: 55, offsetY: -5 } },
    { id: 'shoulder_left', name: 'Vai trái', points: [{ top: '28%', left: '38%' }], label: { side: 'left', offsetX: -50, offsetY: 0 } },
    { id: 'shoulder_right', name: 'Vai phải', points: [{ top: '28%', left: '62%' }], label: { side: 'right', offsetX: 50, offsetY: 0 } },
    { id: 'chest', name: 'Lồng ngực', points: [{ top: '38%', left: '50%' }], label: { side: 'right', offsetX: 65, offsetY: 0 } },
    { id: 'belly', name: 'Bụng', points: [{ top: '53%', left: '50%' }], label: { side: 'right', offsetX: 60, offsetY: 0 } },
    { id: 'hips', name: 'Hông và thắt lưng', points: [{ top: '63%', left: '50%' }], label: { side: 'right', offsetX: 55, offsetY: 0 } },
    { id: 'leg_left', name: 'Chân trái', points: [{ top: '90%', left: '45%' }], label: { side: 'left', offsetX: -45, offsetY: 0 } },
    { id: 'leg_right', name: 'Chân phải', points: [{ top: '90%', left: '55%' }], label: { side: 'right', offsetX: 45, offsetY: 0 } }
];

let selectedPainsThisSession = {}; 

function initPainMap() {
    selectedPainsThisSession = {}; 
    const container = document.getElementById('pain-map-svg-container'); 
    if (!container) return;
    
    container.innerHTML = `
    <svg viewBox="0 0 320 480" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
        <path d="M 120 125 Q 160 145 200 125 L 230 215 C 260 315 300 395 310 435 Q 160 455 10 435 C 20 395 60 315 90 215 Z" fill="#F8BBD0" />
        <path d="M 120 135 Q 100 195 140 245 L 155 255 L 120 135 Z" fill="#FFCCBC" />
        <path d="M 200 135 Q 220 195 180 245 L 165 255 L 200 135 Z" fill="#FFCCBC" />
        <circle cx="160" cy="70" r="38" fill="#FFCCBC" />
        <path d="M 124 60 Q 160 75 196 60 Q 196 45 160 40 Q 124 45 124 60 Z" fill="#5D4037" />
    </svg>`;
    
    painAreasConfig.forEach(area => {
        area.points.forEach(point => {
            const dot = document.createElement('div'); 
            dot.className = `pain-dot-${area.id}`; 
            dot.style.position = 'absolute'; 
            dot.style.top = point.top; 
            dot.style.left = point.left; 
            dot.style.width = '30px'; 
            dot.style.height = '30px';
            dot.style.background = 'white'; 
            dot.style.border = '3px solid #ccc'; 
            dot.style.borderRadius = '50%'; 
            dot.style.transform = 'translate(-50%, -50%)'; 
            dot.style.zIndex = '10'; 
            dot.style.cursor = 'pointer'; 
            dot.style.transition = 'all 0.3s';
            
            dot.onclick = () => togglePainDot(area.id, area.name); 
            container.appendChild(dot);

            // Thêm label text với đường nối
            if (area.label) {
                const labelWrapper = document.createElement('div');
                labelWrapper.style.position = 'absolute';
                labelWrapper.style.top = point.top;
                labelWrapper.style.left = point.left;
                labelWrapper.style.transform = 'translate(-50%, -50%)';
                labelWrapper.style.zIndex = '5';
                labelWrapper.style.pointerEvents = 'none';
                labelWrapper.style.display = 'flex';
                labelWrapper.style.alignItems = 'center';
                labelWrapper.style.whiteSpace = 'nowrap';

                const line = document.createElement('div');
                line.style.width = Math.abs(area.label.offsetX) - 15 + 'px';
                line.style.height = '1px';
                line.style.background = '#555';
                line.style.flexShrink = '0';

                const text = document.createElement('span');
                text.innerText = area.name;
                text.style.fontSize = '11px';
                text.style.color = '#333';
                text.style.fontWeight = '600';
                text.style.background = 'rgba(255,255,255,0.7)';
                text.style.padding = '1px 4px';
                text.style.borderRadius = '3px';

                if (area.label.side === 'right') {
                    labelWrapper.style.left = `calc(${point.left} + 18px)`;
                    labelWrapper.style.transform = `translateY(calc(-50% + ${area.label.offsetY}px))`;
                    labelWrapper.appendChild(line);
                    labelWrapper.appendChild(text);
                } else {
                    labelWrapper.style.left = 'auto';
                    labelWrapper.style.right = `calc(100% - ${parseFloat(point.left)}% + 18px)`;
                    labelWrapper.style.transform = `translateY(calc(-50% + ${area.label.offsetY}px))`;
                    labelWrapper.style.flexDirection = 'row-reverse';
                    labelWrapper.appendChild(line);
                    labelWrapper.appendChild(text);
                    labelWrapper.style.flexDirection = 'row-reverse';
                }
                container.appendChild(labelWrapper);
            }
        });
    });
}

function togglePainDot(id, name) {
    if(navigator.vibrate) navigator.vibrate(20);
    
    const dots = document.querySelectorAll(`.pain-dot-${id}`);
    
    if (selectedPainsThisSession[id]) { 
        delete selectedPainsThisSession[id]; 
        dots.forEach(dot => {
            dot.style.background = 'white'; 
            dot.style.borderColor = '#ccc'; 
            dot.style.boxShadow = 'none'; 
        });
    } else { 
        selectedPainsThisSession[id] = name; 
        dots.forEach(dot => {
            dot.style.background = '#d32f2f'; 
            dot.style.borderColor = '#b71c1c'; 
            dot.style.boxShadow = '0 0 15px rgba(211, 47, 47, 0.6)'; 
        });
    }
}

function submitPainMap() {
    // 1. Chỉ lấy tên các vùng bị đau, bỏ hoàn toàn việc lưu lịch sử số lần
    let finalResultArray = [];
    for (let id in selectedPainsThisSession) { 
        finalResultArray.push(selectedPainsThisSession[id]); 
    }
    
    // 2. Nối các tên lại bằng dấu phẩy, nếu không chọn gì thì ghi "Không mỏi"
    currentUser.painAreas = finalResultArray.length > 0 ? finalResultArray.join(', ') : "Không mỏi"; 
    
    // 3. Chuyển sang màn hình Body Scan
    switchStage(3); 
}

// ==========================================
// 9. STAGE 3: BODY SCAN
// ==========================================
const bodySteps = [
    { id: 'head', text: "Hít sâu... thở ra và thả lỏng vùng cổ và cơ hàm.", points: [{ top: '25%', left: '50%' }] },
    { id: 'shoulders', text: "Thả lỏng đôi vai... trút bỏ mọi gánh nặng.", points: [{ top: '28%', left: '38%' }, { top: '28%', left: '62%' }] },
    { id: 'chest', text: "Hít sâu... lồng ngực mở rộng đón nhận bình an.", points: [{ top: '38%', left: '50%' }] },
    { id: 'belly', text: "Đặt tay lên bụng... gửi trọn yêu thương đến con.", points: [{ top: '53%', left: '50%' }] },
    { id: 'hips', text: "Thả lỏng vùng hông và thắt lưng...", points: [{ top: '63%', left: '50%' }] },
    { id: 'legs', text: "Thả lỏng đôi chân... bám rễ vững chãi vào mặt đất.", points: [{ top: '90%', left: '45%' }, { top: '90%', left: '55%' }] }
];

let s3_currentStep = 0; let faceTimeout = null; 
const containerBody = document.getElementById('meditation-container'); 
const guideTextBody = document.getElementById('guide-text-body'); 
const actionButtonsBody = document.getElementById('action-buttons-body');

function initBodyScan() {
    s3_currentStep = 0; 
    if(actionButtonsBody) actionButtonsBody.style.display = 'none'; 
    if(!containerBody) return;
    containerBody.innerHTML = '';
    
    containerBody.innerHTML = `
    <svg id="pregnant-standing-svg" viewBox="0 0 320 480" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; transition: all 1.2s ease-in-out;">
        <path d="M 130 60 Q 160 40 190 60 L 195 90 Q 160 100 125 90 Z" fill="#5D4037" />
        <rect x="135" y="430" width="20" height="50" fill="#FFCCBC" /> 
        <rect x="165" y="430" width="20" height="50" fill="#FFCCBC" /> 
        <rect x="150" y="105" width="20" height="25" fill="#FFCCBC" />
        <path d="M 120 125 Q 160 145 200 125 L 230 215 C 260 315 300 395 310 435 Q 160 455 10 435 C 20 395 60 315 90 215 Z" fill="#F8BBD0" />
        <path d="M 120 135 Q 100 195 140 245 L 155 255 L 120 135 Z" fill="#FFCCBC" /> 
        <path d="M 200 135 Q 220 195 180 245 L 165 255 L 200 135 Z" fill="#FFCCBC" />
        <circle cx="160" cy="70" r="38" fill="#FFCCBC" />
        <g id="sad-face">
            <path d="M 142 72 Q 150 78 158 72" fill="none" stroke="#5D4037" stroke-width="2" />
            <path d="M 165 72 Q 173 78 181 72" fill="none" stroke="#5D4037" stroke-width="2" />
            <path d="M 152 92 Q 160 92 168 92" fill="none" stroke="#5D4037" stroke-width="2" />
        </g>
        <g id="happy-face" style="display: none;">
            <path d="M 142 75 Q 150 68 158 75" fill="none" stroke="#5D4037" stroke-width="2" />
            <path d="M 165 75 Q 173 68 181 75" fill="none" stroke="#5D4037" stroke-width="2" />
            <path d="M 152 90 Q 160 98 168 90" fill="none" stroke="#5D4037" stroke-width="2" />
        </g>
        <path d="M 124 60 Q 160 75 196 60 Q 196 45 160 40 Q 124 45 124 60 Z" fill="#5D4037" />
    </svg>`;
    
    bodySteps.forEach((step, idx) => {
        step.points.forEach(point => {
            const dot = document.createElement('div'); dot.className = 'dot'; 
            dot.style.top = point.top; dot.style.left = point.left;
            dot.style.width = '25px'; dot.style.height = '25px'; 
            dot.style.transform = 'translate(-50%, -50%)'; 
            dot.style.zIndex = '1000'; dot.style.position = 'absolute';
            dot.onclick = (e) => { e.preventDefault(); e.stopPropagation(); handleDotClick(idx); }; 
            dot.dataset.stepIndex = idx; 
            containerBody.appendChild(dot);
        });
    });
    activateStepBody(0);
}

function handleDotClick(idx) {
    if(idx !== s3_currentStep) return;
    
    const sadFace = document.getElementById('sad-face'); 
    const happyFace = document.getElementById('happy-face');
    if(sadFace) sadFace.style.display = 'none'; 
    if(happyFace) happyFace.style.display = 'block'; 
    clearTimeout(faceTimeout); 
    
    faceTimeout = setTimeout(() => { 
        if(sadFace) sadFace.style.display = 'block'; 
        if(happyFace) happyFace.style.display = 'none'; 
    }, 3000); 
    
    if(navigator.vibrate) navigator.vibrate(50);
    
    document.querySelectorAll(`.dot[data-step-index="${idx}"]`).forEach(d => { 
        d.classList.remove('active'); d.classList.add('relaxed'); 
        const rip = document.createElement('div'); rip.className = 'ripple'; 
        rip.style.top = d.style.top; rip.style.left = d.style.left; 
        rip.style.zIndex = '999'; containerBody.appendChild(rip); 
        setTimeout(()=>rip.remove(), 5000); 
    });
    
    s3_currentStep++; 
    setTimeout(() => activateStepBody(s3_currentStep), 3000);
}

function activateStepBody(index) {
    if(index >= bodySteps.length) { finishGameBody(); return; }
    if(guideTextBody) { 
        guideTextBody.style.opacity = 0; 
        setTimeout(() => { guideTextBody.innerText = bodySteps[index].text; guideTextBody.style.opacity = 1; }, 100); 
    }
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active')); 
    document.querySelectorAll(`.dot[data-step-index="${index}"]`).forEach(d => d.classList.add('active'));
}

function finishGameBody() { 
    if(guideTextBody) { 
        guideTextBody.innerHTML = "Tuyệt vời. Mẹ và bé đã hoàn toàn thư giãn.<br>Hãy giữ cảm giác bình an này nhé."; 
        guideTextBody.style.marginTop = "40px"; 
    }
    if(actionButtonsBody) actionButtonsBody.style.display = 'flex'; 
    
    document.querySelectorAll('.dot').forEach(d => { 
        d.style.opacity = '0'; d.style.pointerEvents = 'none'; 
        setTimeout(() => d.style.display = 'none', 500); 
    });
    
    const svg = document.getElementById('pregnant-standing-svg'); 
    const sadFace = document.getElementById('sad-face'); 
    const happyFace = document.getElementById('happy-face');
    if(svg) { svg.style.transformOrigin = "center center"; svg.style.transform = "scale(0.75) translateY(60px)"; } 
    if (faceTimeout) clearTimeout(faceTimeout);
    if(sadFace) sadFace.style.display = 'none'; 
    if(happyFace) happyFace.style.display = 'block'; 
    if(typeof launchFireworks === 'function') launchFireworks();
}

// ==========================================
// 10. STAGE 4: CAPYBARA
// ==========================================
window.selectEmotion = function(name) {
    currentUser.capybaraMood = name; 
    if(navigator.vibrate) navigator.vibrate(30);
    const s1 = document.getElementById('selection-screen'); 
    const s2 = document.getElementById('feedback-screen');
    if (s1 && s2) { 
        s1.style.display = 'none'; 
        s2.style.display = 'block'; 
        setTimeout(() => s2.style.opacity = '1', 50); 
    }
}

// ==========================================
// 11. STAGE 5: ĐÁM MÂY
// ==========================================
const inputContainerCloud = document.getElementById('input-container-cloud'); 
const thoughtInput = document.getElementById('thoughtInput'); 
const hintTextCloud = document.getElementById('hint-text-cloud'); 
let s5_isHidden = false; 
const cloudColors = ['#FFFFFF', '#FFEBEE', '#FFF9C4', '#E1F5FE', '#F3E5F5', '#E0F2F1'];

function createCloud(e) {
    if(e) e.stopPropagation(); 
    const txt = thoughtInput.value.trim(); 
    if(txt==="") { thoughtInput.focus(); return; }
    
    if(currentUser.cloudThought) { currentUser.cloudThought += "; " + txt; } 
    else { currentUser.cloudThought = txt; }
    
    inputContainerCloud.classList.add('hidden'); 
    hintTextCloud.innerText = `Thở ra và quan sát đám mây trôi cùng cảm xúc ${txt}...`; 
    hintTextCloud.classList.add('show'); 
    s5_isHidden = true;
    
    setTimeout(() => thoughtInput.placeholder = "Còn suy nghĩ nào nữa không?", 500);
    
    const wrap = document.createElement('div'); 
    wrap.className = 'cloud-wrapper ' + (Math.random()>0.5?'flying-right':'flying-left'); 
    wrap.style.marginTop = `${Math.floor(Math.random()*60)-30}px`;
    
    const body = document.createElement('div'); body.className = 'cloud-body'; body.innerText = txt; 
    body.style.setProperty('--cloud-color', cloudColors[Math.floor(Math.random()*cloudColors.length)]);
    wrap.appendChild(body); 
    document.getElementById('stage-5').appendChild(wrap); 
    thoughtInput.value = ''; thoughtInput.blur();
    
    setTimeout(() => { 
        wrap.remove(); 
        if(s5_isHidden) { 
            inputContainerCloud.classList.remove('hidden'); 
            hintTextCloud.classList.remove('show'); 
            setTimeout(() => hintTextCloud.innerText = "Chạm vào bầu trời để viết tiếp...", 500); 
            s5_isHidden=false; 
        } 
    }, 20000);
}

document.getElementById('stage-5').addEventListener('click', () => { 
    if(s5_isHidden) { 
        inputContainerCloud.classList.remove('hidden'); 
        hintTextCloud.classList.remove('show'); 
        setTimeout(() => hintTextCloud.innerText = "Chạm vào bầu trời để viết tiếp...", 500); 
        s5_isHidden=false; 
    } 
});

if(inputContainerCloud) inputContainerCloud.addEventListener('click', e => e.stopPropagation());

// ==========================================
// 12. STAGE 6: HŨ BÌNH AN
// ==========================================
const introJar = document.getElementById('intro-screen-jar'); 
const writeJar = document.getElementById('write-screen-jar'); 
const jarScreenFinal = document.getElementById('jar-screen-final'); 
const noteInput = document.getElementById('note-input'); 
const jar = document.getElementById('jar'); 
const finalMsg = document.getElementById('final-message'); 
const contBtnJar = document.getElementById('continue-btn-jar');

function goToWrite() {
    introJar.style.opacity = '0';
    setTimeout(() => { 
        introJar.style.display = 'none'; 
        writeJar.style.display = 'flex'; 
        setTimeout(() => writeJar.style.opacity='1', 50); 
    }, 500);
}

function saveToJar() {
    const msg = noteInput.value.trim(); 
    if(msg === "") { alert("Chị hãy viết vài dòng nhé!"); return; }
    
    currentUser.jarNote = msg; 
    writeJar.style.opacity = '0';
    setTimeout(() => { 
        writeJar.style.display = 'none'; 
        jarScreenFinal.style.display = 'flex'; 
        triggerDroppingHeart(); 
    }, 500);
}

function triggerDroppingHeart() {
    const flyingHeart = document.createElement('div'); 
    flyingHeart.classList.add('falling-heart', 'animate-drop'); 
    jarScreenFinal.appendChild(flyingHeart);
    
    setTimeout(() => { 
        flyingHeart.remove(); 
        const landedHeart = document.createElement('div'); 
        landedHeart.className = 'heart-in-jar'; 
        jar.appendChild(landedHeart); 
        finalMsg.style.opacity = "1"; 
        contBtnJar.style.display = "block"; 
        setTimeout(() => contBtnJar.style.opacity = "1", 100); 
        if(navigator.vibrate) navigator.vibrate([50, 100, 50]); 
    }, 1400); 
}

// ==========================================
// 13. STAGE ĐÁNH GIÁ SỰ HỮU ÍCH
// ==========================================

const stageNames = {
    1: 'Chuông "Dừng Lại"',
    2: 'Thở cùng Rồng',
    3: 'Cảm nhận nỗi đau',
    4: 'Rà soát cơ thể',
    5: 'Gọi tên cảm xúc',
    6: 'Quan sát suy nghĩ',
    7: 'Hũ Bình An'
};

const satisfactionLevels = {
    1: { text: 'Rất không hài lòng', emoji: '😞', color: '#c62828' },
    2: { text: 'Không hài lòng', emoji: '😕', color: '#e65100' },
    3: { text: 'Bình thường', emoji: '😐', color: '#f57f17' },
    4: { text: 'Hài lòng', emoji: '😊', color: '#558b2f' },
    5: { text: 'Rất hài lòng', emoji: '😄', color: '#2e7d32' }
};

let stageRatings = {}; // { 1: 3, 2: 5, ... }

function initUsefulnessEval() {
    stageRatings = {};
    updateStageSliderDisplay();
    updateSatisfactionDisplay();
    updateRatingSummary();
}

function updateStageSliderDisplay() {
    const slider = document.getElementById('stage-select-range');
    if (!slider) return;
    const val = parseInt(slider.value);
    const nameEl = document.getElementById('stage-select-name');
    if (nameEl) nameEl.innerText = `Giai đoạn ${val}: ${stageNames[val]}`;
    
    // Nếu stage này đã có rating, set lại slider satisfaction
    const satSlider = document.getElementById('satisfaction-range');
    if (satSlider && stageRatings[val]) {
        satSlider.value = stageRatings[val];
    } else if (satSlider) {
        satSlider.value = 3;
    }
    updateSatisfactionDisplay();
}

function updateSatisfactionDisplay() {
    const slider = document.getElementById('satisfaction-range');
    if (!slider) return;
    const val = parseInt(slider.value);
    const data = satisfactionLevels[val];
    
    const emojiEl = document.getElementById('satisfaction-emoji');
    const statusEl = document.getElementById('satisfaction-status');
    if (emojiEl) emojiEl.innerText = data.emoji;
    if (statusEl) {
        statusEl.innerText = `${val} - ${data.text}`;
        statusEl.style.color = data.color;
    }
    if(navigator.vibrate) navigator.vibrate(5);
}

function saveCurrentStageRating() {
    const stageSlider = document.getElementById('stage-select-range');
    const satSlider = document.getElementById('satisfaction-range');
    if (!stageSlider || !satSlider) return;
    
    const stageNum = parseInt(stageSlider.value);
    const rating = parseInt(satSlider.value);
    stageRatings[stageNum] = rating;
    
    updateRatingSummary();
    
    // Auto-chuyển sang stage tiếp theo nếu chưa hết
    if (stageNum < 7) {
        stageSlider.value = stageNum + 1;
        updateStageSliderDisplay();
    }
}

function updateRatingSummary() {
    const summaryEl = document.getElementById('rating-summary');
    if (!summaryEl) return;
    
    let html = '';
    const ratedCount = Object.keys(stageRatings).length;
    
    for (let i = 1; i <= 7; i++) {
        if (stageRatings[i]) {
            const sat = satisfactionLevels[stageRatings[i]];
            html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #eee;">
                <span style="font-size:13px; color:#333;">${stageNames[i]}</span>
                <span style="font-size:13px; font-weight:bold; color:${sat.color};">${sat.emoji} ${stageRatings[i]}/5</span>
            </div>`;
        } else {
            html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #eee;">
                <span style="font-size:13px; color:#aaa;">${stageNames[i]}</span>
                <span style="font-size:13px; color:#ccc;">Chưa đánh giá</span>
            </div>`;
        }
    }
    
    summaryEl.innerHTML = html;
    
    // Hiện nút hoàn thành khi đã đánh giá ít nhất 1 stage
    const finishBtn = document.getElementById('finish-eval-btn');
    if (finishBtn) {
        finishBtn.style.display = ratedCount > 0 ? 'inline-block' : 'none';
    }
}

function submitUsefulnessEval() {
    // Tạo chuỗi kết quả
    let parts = [];
    for (let i = 1; i <= 7; i++) {
        const score = stageRatings[i] || 'N/A';
        parts.push(`Stage ${i}: ${score} điểm`);
    }
    currentUser.usefulness = parts.join(' | ');
    
    finishJourney();
}

function submitEval1() { 
    currentUser.eval1 = document.getElementById('eval-1-range').value; 
    switchStage('eval-2'); 
}

function submitEval2() { 
    currentUser.eval2 = document.getElementById('eval-2-range').value; 
    finishJourney(); 
}

// ==========================================
// 14. LƯU HÀNH TRÌNH VÀO GOOGLE SHEET & ĐIỀU HƯỚNG
// ==========================================
function finishJourney() {
    const finalSlider = document.getElementById('final-range'); 
    if(finalSlider && typeof emotionLevels !== 'undefined') { 
        const val = parseInt(finalSlider.value); 
        currentUser.finalMood = emotionLevels[val] ? emotionLevels[val].text : val; 
    }
    
    // Lưu tạm Offline để xem lịch sử
    currentUser.created_at = new Date().toISOString(); 
    let history = JSON.parse(localStorage.getItem('myJourneys')) || []; 
    history.push(currentUser); 
    localStorage.setItem('myJourneys', JSON.stringify(history));
    
    // Hiển thị trạng thái đang lưu
    const btn = document.getElementById('finish-eval-btn'); 
    if (btn) { 
        btn.innerText = "Đang lưu..."; 
        btn.style.pointerEvents = 'none'; 
        btn.style.opacity = '0.7'; 
    }
    
    // TẠO BẢN SAO DỮ LIỆU ĐỂ GỬI & FORMAT LẠI THỜI GIAN
    let dataToSend = JSON.parse(JSON.stringify(currentUser)); 
    
    let now = new Date();
    let dd = String(now.getDate()).padStart(2, '0');
    let mm = String(now.getMonth() + 1).padStart(2, '0');
    let yyyy = now.getFullYear();
    let hh = String(now.getHours()).padStart(2, '0');
    let min = String(now.getMinutes()).padStart(2, '0');
    let ss = String(now.getSeconds()).padStart(2, '0');
    
    dataToSend.created_at = `${hh}:${min}:${ss} ${dd}/${mm}/${yyyy}`;

    fetch(GOOGLE_SCRIPT_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify(dataToSend) 
    })
    .then(response => response.json())
    .then(data => { 
        if(data.result === 'success') {
            alert("Tuyệt vời! Hành trình bình an của chị đã được lưu lại."); 
        } else {
            alert("Có lỗi khi lưu lại: " + data.error);
        }
        location.reload(); 
    })
    .catch(error => { 
        console.error("Lỗi mạng: ", error); 
        alert("Đã hoàn thành! (Dữ liệu đã lưu tạm trên thiết bị do lỗi mạng)."); 
        location.reload(); 
    });
}

// Hàm quay lại với thứ tự: Hũ (6) -> Cảm xúc (7) -> Đánh giá 1 -> Đánh giá 2
function goBack() {
    if (currentStage === 1) { document.getElementById('stage-1').classList.remove('active'); document.getElementById('stage-1').style.display='none'; document.getElementById('stage-emotion-check').style.display='flex'; document.getElementById('stage-emotion-check').classList.add('active'); return; }
    if (currentStage === 2) { switchStage(1); return; }
    if (currentStage === 4) { switchStage(2); return; }
    if (currentStage === 5) { switchStage(4); return; }
    if (currentStage === 'pain-map') { switchStage(5); return; }
    if (currentStage === 3) { switchStage('pain-map'); return; }
    if (currentStage === 6) { switchStage(3); return; }
    
    // ĐÃ SỬA: Sắp xếp lại thứ tự lùi cho 3 trang cuối
    if (currentStage === 7) { switchStage(6); return; }          // Cảm xúc cuối lùi về Hũ
    if (currentStage === 'usefulness') { switchStage(7); return; } // Đánh giá hữu ích lùi về Cảm xúc cuối
    if (currentStage === 'eval-1') { switchStage(7); return; }   // Đánh giá 1 lùi về Cảm xúc cuối
    if (currentStage === 'eval-2') { switchStage('eval-1'); return; } // Đánh giá 2 lùi về Đánh giá 1
    
    switchStage(0);
    const modal = document.getElementById('welcome-modal');
    if(modal) { modal.style.display = 'block'; setTimeout(() => modal.style.opacity = '1', 10); }
}
// ==========================================
// 15. TÍNH NĂNG ADMIN & LỊCH SỬ NGƯỜI DÙNG
// ==========================================
function openAdminPanel() { 
    const modal = document.getElementById('admin-modal'); 
    if(modal) {
        modal.style.display = 'block'; 
        fetchHistory(); 
    }
}

function closeAdmin() { 
    const modal = document.getElementById('admin-modal');
    if(modal) modal.style.display = 'none'; 
    const phoneInput = document.getElementById('input-phone');
    if(phoneInput) phoneInput.value = ""; 
}

function fetchHistory() {
    let history = JSON.parse(localStorage.getItem('myJourneys')) || []; 
    const tbody = document.getElementById('admin-table-body'); 
    if (!tbody) return; 
    tbody.innerHTML = '';
    
    history.slice().reverse().forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(row.created_at).toLocaleString('vi-VN')}</td>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight:bold;">${row.name || '...'}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${row.phone || '...'}</td>
            <td style="padding: 10px; border: 1px solid #ddd; color:#b71c1c;">${row.initialMood || '...'}</td>
            <td style="padding: 10px; border: 1px solid #ddd; color:#e65100;">${row.capybaraMood || '...'}</td>
            <td style="padding: 10px; border: 1px solid #ddd; color:#006064;">${row.cloudThought || '...'}</td>
            <td style="padding: 10px; border: 1px solid #ddd; color:#4a148c; font-style:italic;">"${row.jarNote || '...'}"</td>
            <td style="padding: 10px; border: 1px solid #ddd; color:#1b5e20; font-weight:bold;">${row.finalMood || '...'}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">
                <button onclick="deleteJourney(${index})" style="background:#f44336; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Xóa</button>
            </td>
        `; 
        tbody.appendChild(tr);
    });
}

function showMyHistory() {
    const modal = document.getElementById('my-history-modal'); 
    if(modal) modal.style.display = 'block';
    
    let history = JSON.parse(localStorage.getItem('myJourneys')) || []; 
    let myData = history.filter(item => item.phone === currentUser.phone);
    const content = document.getElementById('my-history-content');
    if(!content) return;
    
    if(myData.length === 0) { 
        content.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">Chị chưa có nhật ký nào. Hãy bắt đầu hành trình nhé!</div>'; 
        return; 
    }
    
    let html = ''; 
    myData.slice().reverse().forEach(row => {
        html += `
            <div style="background: #fdfaf6; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 5px solid #00897b; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-size: 14px; color: #888; margin-bottom: 10px;">📅 ${new Date(row.created_at).toLocaleString('vi-VN')}</div>
                <div style="display: flex; justify-content: space-between; background: #fff; padding: 10px; border-radius: 8px;">
                    <div>🌱 <b>Đầu:</b> ${row.initialMood || '...'}</div>
                    <div>✨ <b>Cuối:</b> <span style="color: #e91e63; font-weight:bold;">${row.finalMood || '...'}</span></div>
                </div>
                <p>🦁 <b>Bé Capybara:</b> ${row.capybaraMood || '...'}</p>
                <p>☁️ <b>Suy nghĩ:</b> <i>"${row.cloudThought || '...'}"</i></p>
                <div style="background: #e0f2f1; padding: 10px; border-radius: 8px; margin-top: 10px; color: #004d40;">💌 <b>Lời nhắn:</b><br>"${row.jarNote || '...'}"</div>
            </div>`;
    }); 
    content.innerHTML = html;
}

function closeMyHistory() { 
    const modal = document.getElementById('my-history-modal');
    if(modal) modal.style.display = 'none'; 
}

function deleteJourney(index) {
    if(confirm("Bạn có chắc muốn xóa dòng này khỏi bảng Admin không?\n(Yên tâm, người dùng vẫn xem lại được nhật ký này)")) {
        let history = JSON.parse(localStorage.getItem('myJourneys')) || []; 
        let realIndex = history.length - 1 - index; 
        history.splice(realIndex, 1);
        localStorage.setItem('myJourneys', JSON.stringify(history)); 
        fetchHistory(); 
    }
}

// Khởi chạy khi load xong web
document.addEventListener("DOMContentLoaded", function() { 
    if(document.getElementById('welcome-modal')) {
        document.getElementById('welcome-modal').style.display = 'block'; 
    }
});



