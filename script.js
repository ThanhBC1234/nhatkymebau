// --- CẤU HÌNH ---
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6YfzmkVPwief31DVP7UnzWS6Wz-wiAOlrvr0fkHbMpgq8lw/viewform'; 

let currentStage = 0; 
let userName = "Chị";
//----------PHẦN ĐĂNG NHÂP--------------//
let currentUser = {
    phone: '',
    name: '',
    initialMood: 0,
    capybaraMood: '',
    cloudThought: '',
    jarNote: '',
    finalMood: 0
};


// Hàm 1: Kiểm tra số điện thoại
function checkPhone() {
    const phoneInput = document.getElementById('input-phone').value.trim();
    
    // Kiểm tra độ dài số điện thoại
    if (!phoneInput || phoneInput.length < 9) {
        alert("Vui lòng nhập số điện thoại hợp lệ ạ!");
        return;
    }

    // Lưu tạm vào biến
    currentUser.phone = phoneInput;
    console.log("SĐT đã nhận:", currentUser.phone); // Kiểm tra trong Console

    // Kiểm tra xem trình duyệt này đã từng lưu người này chưa (LocalStorage)
    // Lưu ý: Hiện tại mình chưa check dưới SQL Server để cho nhanh, 
    // mình check tạm ở trình duyệt nhé.
    const storedUser = localStorage.getItem('user_' + phoneInput);

    if (storedUser) {
        // TRƯỜNG HỢP 1: ĐÃ CÓ (Khách cũ trên máy này) -> Chào mừng
        const userData = JSON.parse(storedUser);
        currentUser.name = userData.name; // Lấy lại tên cũ
        
        document.getElementById('step-phone').style.display = 'none';
        document.getElementById('step-welcome-back').style.display = 'block';
        document.getElementById('welcome-message').innerHTML = `Chào mừng chị <b>${userData.name}</b> đã quay lại!`;
    } else {
        // TRƯỜNG HỢP 2: CHƯA CÓ (Khách mới) -> Hiện ô nhập tên
        document.getElementById('step-phone').style.display = 'none';
        document.getElementById('step-name').style.display = 'block';
    }
}

// Hàm 2: Đăng ký người dùng mới
function registerAndStart() {
    const nameInput = document.getElementById('input-name').value.trim();
    
    if (!nameInput) {
        alert("Chị ơi, hãy nhập tên để hệ thống xưng hô nhé!");
        return;
    }

    currentUser.name = nameInput;
    userName = nameInput; // Cập nhật biến hiển thị

    // Lưu sơ bộ vào localStorage để lần sau vào lại web nó nhớ
    localStorage.setItem('user_' + currentUser.phone, JSON.stringify(currentUser));
    
    startGameDirectly();
}

// --- HÀM 3: VÀO GAME LUÔN ---
function startGameDirectly() {
    const modal = document.getElementById('welcome-modal');
    modal.style.transition = "opacity 0.5s";
    modal.style.opacity = "0";
    
    setTimeout(() => {
        modal.style.display = 'none'; 
        
        // Ẩn màn hình login (Stage 0)
        document.getElementById('stage-0').style.display = 'none';
        document.getElementById('stage-0').classList.remove('active');

        // Hiện màn hình Check-in cảm xúc
        const emotionStage = document.getElementById('stage-emotion-check');
        emotionStage.style.display = 'flex'; 
        emotionStage.classList.add('active');
        
        // Reset lại giao diện cảm xúc
        updateEmotionDisplay('emotion-range', 'current-emoji', 'current-status');

    }, 500);
}

// Hàm 3: Bắt đầu game (Ẩn Modal và Chuyển màn)
function startGameDirectly() {
    const modal = document.getElementById('welcome-modal');
    modal.style.transition = "opacity 0.5s";
    modal.style.opacity = "0";
    
    setTimeout(() => {
        modal.style.display = 'none'; 
        
        // Ẩn màn hình đăng nhập (Stage 0)
        document.getElementById('stage-0').style.display = 'none';
        document.getElementById('stage-0').classList.remove('active');

        // --- QUAN TRỌNG: HIỆN MÀN HÌNH CẢM XÚC (Emotion Check) ---
        const emotionStage = document.getElementById('stage-emotion-check');
        emotionStage.style.display = 'flex'; // Dùng flex để căn giữa
        emotionStage.classList.add('active');
        
        // Setup giao diện cho màn cảm xúc
        emotionStage.style.justifyContent = 'center';
        emotionStage.style.alignItems = 'center';
        emotionStage.style.height = '100vh';
        emotionStage.style.background = '#e0f2f1';

        // Phát nhạc nền
        if(typeof playBackgroundMusic === 'function') {
            playBackgroundMusic(); 
        }

    }, 500);
}
//--------------------------------------------------//

//----------PHẦN CẢM XÚC----------------//
const emotionLevels = {
    1: { text: "Tuyệt vọng", emoji: "😭", color: "#1a237e" },  // Xanh đậm
    2: { text: "Rất tồi tệ", emoji: "😫", color: "#4a148c" },  // Tím
    3: { text: "Tồi tệ", emoji: "😠", color: "#b71c1c" },      // Đỏ đậm
    4: { text: "Kém", emoji: "☹️", color: "#e53935" },         // Đỏ
    5: { text: "Bình thường (Ổn)", emoji: "😐", color: "#f57f17" }, // Cam đậm
    6: { text: "Tương đối tốt", emoji: "🙂", color: "#fbc02d" },    // Vàng cam
    7: { text: "Tốt", emoji: "😊", color: "#fdd835" },              // Vàng
    8: { text: "Rất tốt", emoji: "😁", color: "#c0ca33" },          // Xanh chuối
    9: { text: "Tuyệt vời", emoji: "😄", color: "#66bb6a" },        // Xanh lá nhẹ
    10: { text: "Rất tuyệt vời", emoji: "🤩", color: "#00c853" }    // Xanh lá đậm
};

// Hàm cập nhật giao diện khi kéo thanh trượt
function updateEmotionDisplay() {
    const slider = document.getElementById('emotion-range');
    const val = parseInt(slider.value);
    const data = emotionLevels[val];

    // Cập nhật Emoji và Chữ
    document.getElementById('current-emoji').innerText = data.emoji;
    document.getElementById('current-status').innerText = `${val} - ${data.text}`;
    document.getElementById('current-status').style.color = data.color;

    // Hiệu ứng rung nhẹ khi kéo (Tạo cảm giác thật hơn)
    if(navigator.vibrate) navigator.vibrate(5);
}

// Hàm xác nhận và chuyển sang Stage 1 (Khu vườn)
function submitInitialEmotion() {
    const slider = document.getElementById('emotion-range');
    
    if (typeof currentUser !== 'undefined' && slider) {
        const val = parseInt(slider.value);
        
        // Lấy chữ từ bảng emotionLevels thay vì lấy số
        if (typeof emotionLevels !== 'undefined' && emotionLevels[val]) {
            currentUser.initialMood = emotionLevels[val].text; 
        } else {
            currentUser.initialMood = val; // Dự phòng
        }

        // Cập nhật lại vào localStorage
        localStorage.setItem('user_' + currentUser.phone, JSON.stringify(currentUser));
    }
    
    // Ẩn màn hình cảm xúc & Chuyển sang Stage 1
    const stageCheck = document.getElementById('stage-emotion-check');
    if (stageCheck) {
        stageCheck.style.display = 'none';
        stageCheck.classList.remove('active');
    }
    
    if(typeof switchStage === 'function') {
        switchStage(1);
    }
}

function updateFinalEmotionDisplay() {
    // 1. Lấy thanh trượt của Stage 7 (final-range)
    const slider = document.getElementById('final-range');
    
    // Kiểm tra cho chắc chắn
    if (!slider) return; 

    const val = parseInt(slider.value);
    
    // Lấy dữ liệu cảm xúc từ biến chung emotionLevels
    const data = emotionLevels[val];

    // 2. Cập nhật Emoji và Chữ ở Stage 7 (final-emoji, final-status)
    const emojiEl = document.getElementById('final-emoji');
    const statusEl = document.getElementById('final-status');

    if (emojiEl) emojiEl.innerText = data.emoji;
    
    if (statusEl) {
        statusEl.innerText = `${val} - ${data.text}`;
        statusEl.style.color = data.color;
    }

    // Hiệu ứng rung nhẹ
    if(navigator.vibrate) navigator.vibrate(5);
}
//--------------------------------------------------------------------------------------------//
const stageBackgrounds = {
    0: "linear-gradient(to bottom, #fffde7, #ffffff)",
    1: "linear-gradient(to bottom, #a5d6a7, #e8f5e9)",
    2: "linear-gradient(to bottom, #e0f7fa, #e0f7fa)",
    3: "linear-gradient(to bottom, #e0f2f1, #b2dfdb)",
    4: "linear-gradient(to bottom, #fff9c4, #fff176)",
    5: "linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)",
    6: "linear-gradient(to top, #fce4ec, #f8bbd0)"
};
function resetStage1() {
  
    document.getElementById('success-panel').style.display = 'none';
    document.getElementById('top-message-area').innerHTML = ''; 

    document.getElementById('greeting-text').style.opacity = '1';
    document.getElementById('monkey-metaphor').style.opacity = '1';
    
    s1_isSuccess = false;
    clearInterval(s1_timer);
    document.getElementById('countdown-display').innerHTML = '';
    
    const stopBtn = document.getElementById('stop-btn');
    stopBtn.style.display = 'flex'; 
    
    const guideText = document.getElementById('guide-text-s1');
    guideText.innerText = 'Nhấn giữ chuông để ra lệnh\n"DỪNG LẠI"';
    guideText.style.opacity = '1';

    s1_monkeys.forEach(m => m.remove());
    s1_monkeys = [];
    createMonkeys(20);
}
function switchStage(stageNum) {
    console.log("Chuyển đến Stage:", stageNum);
    
    // Bắn pháo hoa hiệu ứng
    if(typeof launchFireworks === 'function') launchFireworks();

    // --- BƯỚC 1: ẨN TẤT CẢ CÁC STAGE ĐANG HIỆN ---
    document.querySelectorAll('.stage').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none'; 
    });

    // Ẩn riêng màn hình Emotion Check & Login
    const emotionStage = document.getElementById('stage-emotion-check');
    if (emotionStage) {
        emotionStage.classList.remove('active');
        emotionStage.style.display = 'none';
    }
    const stage0 = document.getElementById('stage-0');
    if (stage0) {
        stage0.classList.remove('active');
        stage0.style.display = 'none';
    }

    // --- BƯỚC 2: THIẾT LẬP NỀN VÀ NÚT QUAY LẠI ---
    if (typeof stageBackgrounds !== 'undefined' && stageBackgrounds[stageNum]) {
        document.body.style.background = stageBackgrounds[stageNum];
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.display = (stageNum === 0) ? 'none' : 'block';
    }

    // --- BƯỚC 3: LOGIC KHỞI TẠO TỪNG MÀN (QUAN TRỌNG) ---

    // STAGE 1: KHỈ
    if (stageNum === 1) {
        if (typeof resetStage1 === 'function') resetStage1();
    } 

    // STAGE 2: RỒNG
    if (stageNum === 2) {
        if (typeof initDragon === 'function') initDragon();
    }

    // STAGE 3: BODY SCAN (SỬA LỖI TẠI ĐÂY)
    if (stageNum === 3) {
        // Chỉ khởi tạo lại game nếu đang đi TỪ DƯỚI LÊN (vd: từ màn 2 lên 3)
        // Nếu biến currentStage chưa có (lần đầu) hoặc nhỏ hơn 3 thì mới reset.
        // Còn nếu từ màn 4 về (currentStage = 4) thì KHÔNG chạy initBodyScan.
        if (typeof currentStage === 'undefined' || currentStage < 3) {
            if(typeof initBodyScan === 'function') initBodyScan(); 
        }
    }

    // STAGE 4: CAPYBARA (Reset về màn hình chọn)
  function selectEmotion(name) {
    // 1. Kiểm tra xem có nhận được lệnh bấm không
    console.log("Đã bấm chọn bé:", name);

    // 2. Lưu lại cảm xúc vào biến chung (nếu biến currentUser tồn tại)
    if (typeof currentUser !== 'undefined') {
        currentUser.capybaraMood = name;
    }

    // 3. Lấy 2 màn hình: Bảng chọn & Bảng lời nhắn
    const selectionScreen = document.getElementById('selection-screen');
    const feedbackScreen = document.getElementById('feedback-screen');

    // 4. Thực hiện chuyển đổi
    if (selectionScreen) {
        // Ẩn bảng chọn đi
        selectionScreen.style.display = 'none';
    } else {
        console.error("Lỗi: Không tìm thấy div có id='selection-screen' trong HTML");
    }

    if (feedbackScreen) {
        // Hiện bảng lời nhắn lên
        feedbackScreen.style.display = 'block';
        
        // Hiệu ứng hiện dần (Fade in)
        feedbackScreen.style.opacity = '0';
        setTimeout(() => {
            feedbackScreen.style.opacity = '1';
        }, 50);
    } else {
        console.error("Lỗi: Không tìm thấy div có id='feedback-screen' trong HTML");
    }
}
    // STAGE 5: ĐÁM MÂY
    if (stageNum === 5) {
        setTimeout(() => {
            const input = document.getElementById('thoughtInput');
            if(input) input.focus();
        }, 500);
    }

    // STAGE 6: HŨ BÌNH AN
    if (stageNum === 6) {
        const btn = document.getElementById('connect-btn-s6');
        if(btn) {
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }, 5000);
        }
    }

    
    
    

    // --- BƯỚC 4: HIỂN THỊ STAGE MỚI ---
    const newStage = document.getElementById(`stage-${stageNum}`);
    if (newStage) {
        newStage.style.display = 'flex'; 
        setTimeout(() => {
            newStage.classList.add('active');
        }, 10);
        
        // Cập nhật biến toàn cục
        if(typeof currentStage !== 'undefined') currentStage = stageNum;
    }
}

// --- PHẦN PHÁO HOA ---
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
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
        ctx.save(); ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
    }
    update() {
        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= 0.02;
    }
}

function launchFireworks() {
    for(let i=0; i<12; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height / 2;
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        for (let j = 0; j < 50; j++) {
            particles.push(new Particle(x, y, color));
        }
    }
    animateFireworks();
}

function animateFireworks() {
    if(particles.length === 0) { ctx.clearRect(0,0,canvas.width, canvas.height); return; }
    requestAnimationFrame(animateFireworks);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        if (p.alpha > 0) { p.update(); p.draw(); } 
        else { particles.splice(index, 1); }
    });
}

// --- STAGE 0: START ---
function startGame() {
    const input = document.getElementById('username-input');
    const val = input.value.trim();
    if (val !== "") userName = val;
    document.getElementById('greeting-text').innerHTML = `Chào mừng chị ${userName},<br>hãy thả lỏng nhé...`;
    switchStage(1);
}

/* --- STAGE 1: MONKEY --- */
const sceneS1 = document.getElementById('scene-s1');
const guideTextS1 = document.getElementById('guide-text-s1');
const countdownDisplay = document.getElementById('countdown-display');
const stopBtn = document.getElementById('stop-btn');
const successPanel = document.getElementById('success-panel');
let s1_monkeys = []; let s1_timer = null; let s1_count = 0; let s1_isSuccess = false;

function createMonkeys(amount) {
    for (let i = 0; i < amount; i++) {
        const monkey = document.createElement('div'); monkey.classList.add('monkey', 'running');
        monkey.innerText = Math.random() > 0.5 ? '🐒' : '🙉';
        let left = Math.random() * 90; let top = Math.random() * 80;
        monkey.style.left = left + '%'; monkey.style.top = top + '%';
        monkey.style.animationDuration = (Math.random() * 1.5 + 1) + 's';
        sceneS1.appendChild(monkey); s1_monkeys.push(monkey);
    }
}
createMonkeys(20);

function startProcess(e) {
    if (s1_isSuccess) return;
    if (e.cancelable) e.preventDefault();
    
    s1_count = 1; 
    guideTextS1.innerText = "Giữ yên..."; 
    guideTextS1.style.opacity = 0.5;
    
    const metaphor = document.getElementById('monkey-metaphor');
    if(metaphor) metaphor.style.opacity = '0';
    
    showNumber(1);
   s1_monkeys.forEach(m => {
        m.classList.add('vanishing'); 
    });

    s1_timer = setInterval(() => { 
        s1_count++; 
        if (s1_count <= 3) {
            showNumber(s1_count); 
        } else {
            finishGameS1(); 
        }
    }, 1000);
}
function showNumber(num) { countdownDisplay.innerHTML = `<div class="count-number">${num}</div>`; }
function cancelProcess() {
    if (s1_isSuccess) return;
    
    clearInterval(s1_timer); 
    countdownDisplay.innerHTML = ''; 
    guideTextS1.innerText = 'Nhấn giữ chuông để ra lệnh\n"DỪNG LẠI"'; 
    guideTextS1.style.opacity = 1; 
    s1_count = 0;
    
    const metaphor = document.getElementById('monkey-metaphor');
    if(metaphor) metaphor.style.opacity = '1';

    s1_monkeys.forEach(m => {
        m.classList.remove('vanishing'); 
    });
}
function finishGameS1() {
    clearInterval(s1_timer); 
    s1_isSuccess = true; 
    

    countdownDisplay.innerHTML = ''; 
    guideTextS1.innerText = '';

    countdownDisplay.innerHTML = '<div class="quiet-text">Tĩnh lặng...</div>';

    // 2. ẨN CÁC DÒNG CHỮ TRÊN ĐẦU
    const greeting = document.getElementById('greeting-text');
    const metaphor = document.getElementById('monkey-metaphor');
    if(greeting) greeting.style.opacity = '0';
    if(metaphor) metaphor.style.opacity = '0';

 
    s1_monkeys.forEach(m => m.remove()); 
    s1_monkeys = []; 

    setTimeout(() => {
        countdownDisplay.innerHTML = ''; 
        stopBtn.style.display = 'none'; 
        
  
        document.getElementById('top-message-area').innerHTML = `<div class="safe-quote"><span class="glowing-star">✨</span><br>"Dừng lại,<br>mình đang ở đây và an toàn."</div>`;
        
     
        setTimeout(() => { successPanel.style.display = 'flex'; }, 1000);
    }, 3000);
}

/* --- STAGE 2: DRAGON --- */

const pinwheel = document.getElementById('pinwheel');
const belly = document.getElementById('belly');
const fire = document.getElementById('fire');
const mouth = document.getElementById('mouth'); 
const instructionDragon = document.getElementById('instruction-dragon');
const dragonBtn = document.getElementById('interaction-area');

let s2_rotation = 0; 
let s2_speed = 2; 
let s2_isHolding = false; 
let s2_energy = 0;
let fireTimeout = null; 
let lastInteractionTime = 0; 

function initDragon() { 
    s2_speed = 2; 
    s2_rotation = 0; 
    s2_energy = 0;
    s2_isHolding = false;
    if(fire) fire.classList.remove("active");
    if(belly) belly.classList.remove("inhaling");
}

function gameLoopS2() {
    // Kiểm tra xem lửa có đang cháy không
    const isBlowing = fire && fire.classList.contains('active');

    if (s2_isHolding) { 
        // Khi đang giữ (hít): Dừng lại nhanh
        s2_speed = s2_speed * 0.9; 
        if (s2_speed < 0.1) s2_speed = 0; 
        if (s2_energy < 100) s2_energy += 0.5; 
    } 
    else { 
        // Khi thả tay:
        if (isBlowing) {
            s2_speed *= 0.995; 
            if (s2_speed < 8) s2_speed = 8; 
        } else {
            if (s2_speed > 0) s2_speed *= 0.96; 
            if (s2_speed < 0.1) s2_speed = 0; 
        }
    }

    // Quay chong chóng
    s2_rotation += s2_speed; 
    if(pinwheel) pinwheel.style.transform = `rotate(${s2_rotation}deg)`;
    
    requestAnimationFrame(gameLoopS2);
}
gameLoopS2();

function startBreath(e) {
    if(e.cancelable && e.type === 'touchstart') e.preventDefault();
    if (s2_isHolding) return; 
    
    s2_isHolding = true; 
    s2_energy = 0; 
    
    instructionDragon.textContent = "Hít sâu..."; 
    instructionDragon.style.color = "#4caf50";
    dragonBtn.textContent = "Đang hít vào..."; 
    
    belly.classList.add("inhaling"); 
    fire.classList.remove("active"); 
    clearTimeout(fireTimeout); 
    mouth.className = "mouth smile";
}

function releaseBreath(e) {
    const now = Date.now();
    if (now - lastInteractionTime < 300) return;
    lastInteractionTime = now;

    if (!s2_isHolding) return;
    s2_isHolding = false;
    let boost = 20 + (s2_energy * 1.5); 
    s2_speed = boost; 
    
    instructionDragon.textContent = "Thở ra ... kéo dài"; 
    instructionDragon.style.color = "#ff5722";
    dragonBtn.textContent = "Nhấn giữ để Hít tiếp"; 
    
    belly.classList.remove("inhaling"); 
    fire.classList.add("active"); 
    mouth.className = "mouth blowing"; 
    
    // Giảm thời gian lửa xuống 2 giây cho gọn gàng (2000ms)
    clearTimeout(fireTimeout);
    fireTimeout = setTimeout(() => {
        if (!s2_isHolding) {
            fire.classList.remove("active"); 
            mouth.className = "mouth smile"; 
            instructionDragon.textContent = "Hít vào..."; 
            instructionDragon.style.color = "#006064";
        }
    }, 2000); 
}

// --- GÁN SỰ KIỆN ---
const oldBtn = document.getElementById('interaction-area');
const newBtn = oldBtn.cloneNode(true);
oldBtn.parentNode.replaceChild(newBtn, oldBtn);

newBtn.addEventListener('mousedown', startBreath);
newBtn.addEventListener('touchstart', startBreath, { passive: false });

window.removeEventListener('mouseup', releaseBreath);
window.removeEventListener('touchend', releaseBreath);
window.addEventListener('mouseup', releaseBreath);
window.addEventListener('touchend', releaseBreath);
/* --- STAGE 3: BODY SCAN --- */
const bodySteps = [
    // --- SỬA TẠI ĐÂY: top đổi từ 15% thành 22% ---
    { id: 'head', text: "Hít sâu... thở ra và thả lỏng vùng cổ và cơ hàm.", points: [{ top: '25%', left: '50%' }] },
    // ---------------------------------------------
    { id: 'shoulders', text: "Thả lỏng đôi vai... trút bỏ mọi gánh nặng.", points: [{ top: '28%', left: '38%' }, { top: '28%', left: '62%' }] },
    { id: 'chest', text: "Hít sâu... lồng ngực mở rộng đón nhận bình an.", points: [{ top: '38%', left: '50%' }] },
    { id: 'belly', text: "Đặt tay lên bụng... gửi trọn yêu thương đến con.", points: [{ top: '53%', left: '50%' }] },
    { id: 'hips', text: "Thả lỏng vùng hông và thắt lưng...", points: [{ top: '63%', left: '50%' }] },
    { id: 'legs', text: "Thả lỏng đôi chân... bám rễ vững chãi vào mặt đất.", points: [{ top: '90%', left: '45%' }, { top: '90%', left: '55%' }] }
];

let s3_currentStep = 0;
let hasStartedRelaxation = false;
let faceTimeout = null; 

const containerBody = document.getElementById('meditation-container');
const guideTextBody = document.getElementById('guide-text-body');
const actionButtonsBody = document.getElementById('action-buttons-body');

// 1. HÀM KHỞI TẠO GAME
function initBodyScan() {
    s3_currentStep = 0; 
    hasStartedRelaxation = false;
    if(actionButtonsBody) actionButtonsBody.style.display = 'none';
    containerBody.innerHTML = '';

    // VẼ SVG NHÂN VẬT
    const svgHTML = `
    <svg id="pregnant-standing-svg" viewBox="0 0 320 480" xmlns="http://www.w3.org/2000/svg" 
         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; transition: all 1.2s ease-in-out;">
        
        <path d="M 130 60 Q 160 40 190 60 L 195 90 Q 160 100 125 90 Z" class="hair-tone" />
        <rect x="135" y="430" width="20" height="50" class="skin-tone" />
        <rect x="165" y="430" width="20" height="50" class="skin-tone" />
        <rect x="150" y="105" width="20" height="25" class="skin-tone" />
        <path class="dress-shape" d="M 120 125 Q 160 145 200 125 L 230 215 C 260 315 300 395 310 435 Q 160 455 10 435 C 20 395 60 315 90 215 Z" style="fill: #F8BBD0;" />
        <path d="M140 165 c0-4 4-6 6-3 2 3 6-1 6 3 0 5-6 8-6 8 s-6-3-6-8z" fill="#D32F2F" opacity="0.8" />
        <path d="M200 185 c0-5 5-8 8-4 3 4 8-1 8 4 0 6-8 10-8 10 s-8-4-8-10z" fill="#D32F2F" opacity="0.8" />
        <path d="M100 355 c0-6 6-9 9-5 4 4 9-2 9 5 0 8-9 12-9 12 s-9-4-9-12z" fill="#D32F2F" opacity="0.8" />
        <path d="M250 385 c0-5 5-8 8-4 3 4 8-1 8 4 0 6-8 10-8 10 s-8-4-8-10z" fill="#D32F2F" opacity="0.8" />
        <path d="M 110 235 Q 160 315 210 235" fill="none" stroke="#F48FB1" stroke-width="3" opacity="0.7"/>
        <path class="skin-tone" d="M 120 135 Q 100 195 140 245 L 155 255 L 120 135 Z" />
        <path class="skin-tone" d="M 200 135 Q 220 195 180 245 L 165 255 L 200 135 Z" />
        <circle cx="150" cy="250" r="15" class="skin-tone" />
        <circle cx="170" cy="250" r="15" class="skin-tone" />
        <circle cx="115" cy="70" r="22" class="hair-tone" />
        <circle cx="205" cy="70" r="22" class="hair-tone" />
        <circle cx="160" cy="70" r="38" class="skin-tone" />

        <g id="sad-face">
             <path d="M 142 72 Q 150 78 158 72" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" />
             <path d="M 165 72 Q 173 78 181 72" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" />
             <path d="M 152 92 Q 160 92 168 92" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" />
        </g>

        <g id="happy-face" style="display: none;">
             <path d="M 142 75 Q 150 68 158 75" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" />
             <path d="M 165 75 Q 173 68 181 75" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" />
             <path d="M 152 90 Q 160 98 168 90" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" />
             <circle cx="138" cy="85" r="5" fill="#FFAB91" opacity="0.6" />
             <circle cx="182" cy="85" r="5" fill="#FFAB91" opacity="0.6" />
        </g>
        <path d="M 124 60 Q 160 75 196 60 Q 196 45 160 40 Q 124 45 124 60 Z" class="hair-tone" />
        <g id="crown">
            <path d="M 142 40 L 135 25 L 152 35 L 160 15 L 168 35 L 185 25 L 178 40 Q 160 35 142 40 Z" fill="#FFD700" stroke="#F57F17" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="160" cy="30" r="3" fill="#E91E63"/> 
            <circle cx="145" cy="35" r="2.5" fill="#2196F3"/>
            <circle cx="175" cy="35" r="2.5" fill="#2196F3"/>
        </g>
    </svg>`;
    
    containerBody.innerHTML = svgHTML;

    // TẠO CÁC NÚT CHẤM TRÒN
    bodySteps.forEach((step, idx) => {
        step.points.forEach(point => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.top = point.top;
            dot.style.left = point.left;
            dot.style.width = '25px';
            dot.style.height = '25px';
            dot.style.transform = 'translate(-50%, -50%)';
            dot.style.zIndex = '1000'; 
            dot.style.position = 'absolute';
            dot.onclick = (e) => { 
                e.preventDefault(); e.stopPropagation();
                handleDotClick(idx); 
            };
            dot.dataset.stepIndex = idx;
            containerBody.appendChild(dot);
        });
    });
    activateStepBody(0);
}

// 2. HÀM XỬ LÝ CLICK (ĐÂY LÀ KHÚC LÀM CHO NÓ CƯỜI)
function handleDotClick(idx) {
    if(idx !== s3_currentStep) return;

    // --- BẮT ĐẦU ĐOẠN CODE ĐIỀU KHIỂN CƯỜI ---
    const sadFace = document.getElementById('sad-face');
    const happyFace = document.getElementById('happy-face');

    // Bước 1: Ẩn mặt buồn, hiện mặt vui
    if(sadFace) sadFace.style.display = 'none';
    if(happyFace) happyFace.style.display = 'block';

    // Bước 2: Đặt hẹn giờ, sau 1 giây (1000ms) thì làm ngược lại
    clearTimeout(faceTimeout); // Xóa hẹn giờ cũ nếu bấm liên tục
    faceTimeout = setTimeout(() => {
        if(sadFace) sadFace.style.display = 'block'; // Hiện lại mặt buồn
        if(happyFace) happyFace.style.display = 'none'; // Ẩn mặt vui đi
    }, 3000); 
    // --- KẾT THÚC ĐOẠN CODE ĐIỀU KHIỂN CƯỜI ---

    if(navigator.vibrate) navigator.vibrate(50);
    
    document.querySelectorAll(`.dot[data-step-index="${idx}"]`).forEach(d => {
        d.classList.remove('active'); 
        d.classList.add('relaxed');
        const rip = document.createElement('div'); 
        rip.className = 'ripple';
        rip.style.top = d.style.top; rip.style.left = d.style.left;
        rip.style.zIndex = '999';
        containerBody.appendChild(rip); 
        setTimeout(()=>rip.remove(), 5000);
    });

    s3_currentStep++; 
    setTimeout(() => activateStepBody(s3_currentStep), 3000);
}

// 3. HÀM KÍCH HOẠT BƯỚC MỚI
function activateStepBody(index) {
    if(index >= bodySteps.length) { finishGameBody(); return; }
    
    if(guideTextBody) {
        guideTextBody.style.opacity = 0;
        setTimeout(() => { 
            guideTextBody.innerText = bodySteps[index].text; 
            guideTextBody.style.opacity = 1; 
        }, 100);
    }
    
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    document.querySelectorAll(`.dot[data-step-index="${index}"]`).forEach(d => {
        d.classList.add('active');
    });
}

// 4. HÀM KẾT THÚC GAME
function finishGameBody() { 
    // 1. Hiện thông báo
    if(guideTextBody) {
        guideTextBody.innerHTML = "Tuyệt vời. Mẹ và bé đã hoàn toàn thư giãn.<br>Hãy giữ cảm giác bình an này nhé.";
        guideTextBody.style.marginTop = "40px"; 
    }
    if(actionButtonsBody) actionButtonsBody.style.display = 'flex'; 
    
    // 2. Ẩn các chấm đỏ
    document.querySelectorAll('.dot').forEach(d => {
        d.style.opacity = '0'; d.style.pointerEvents = 'none';
        setTimeout(() => d.style.display = 'none', 500);
    });

    // 3. XỬ LÝ NHÂN VẬT (Thu nhỏ + CƯỜI)
    const svg = document.getElementById('pregnant-standing-svg');
    const sadFace = document.getElementById('sad-face');
    const happyFace = document.getElementById('happy-face');

    if(svg) {
        svg.style.transformOrigin = "center center";
        svg.style.transform = "scale(0.75) translateY(60px)";
    }

    // --- QUAN TRỌNG: ÉP NHÂN VẬT CƯỜI KHI KẾT THÚC ---
    // Xóa bộ đếm giờ (để nó không tự quay lại mặt buồn nữa)
    if (faceTimeout) clearTimeout(faceTimeout);
    
    // Ẩn mặt buồn, hiện mặt vui
    if(sadFace) sadFace.style.display = 'none';
    if(happyFace) happyFace.style.display = 'block';
    // --------------------------------------------------

    if(typeof launchFireworks === 'function') launchFireworks();
}
/* --- STAGE 4: CAPYBARA --- */
function selectEmotion(name) {
    currentUser.capybaraMood = emotionName;
    console.log("Đã chọn:", emotionName);
    if(navigator.vibrate) navigator.vibrate(30);
    const s1 = document.getElementById('selection-screen'); const s2 = document.getElementById('feedback-screen');
    s1.style.opacity = '0'; s1.style.pointerEvents = 'none';
    setTimeout(() => { s1.style.display = 'none'; s2.style.display = 'block'; setTimeout(() => s2.style.opacity = '1', 50); }, 500);
}

/* --- STAGE 5: CLOUDS --- */
const inputContainerCloud = document.getElementById('input-container-cloud');
const thoughtInput = document.getElementById('thoughtInput');
const hintTextCloud = document.getElementById('hint-text-cloud');
let s5_isHidden = false; const cloudColors = ['#FFFFFF', '#FFEBEE', '#FFF9C4', '#E1F5FE', '#F3E5F5', '#E0F2F1'];

function createCloud(e) {
    if(e) e.stopPropagation();
    const txt = thoughtInput.value.trim(); 
    if(txt==="") { thoughtInput.focus(); return; }
    if(currentUser.cloudThought) {
        currentUser.cloudThought += "; " + txt;
    } else {
        currentUser.cloudThought = txt;
    }
    inputContainerCloud.classList.add('hidden'); 
    hintTextCloud.innerText = `Thở ra và quan sát đám mây trôi cùng cảm xúc ${txt}...`;
    hintTextCloud.classList.add('show'); 
    s5_isHidden = true;
    setTimeout(() => thoughtInput.placeholder = "Còn suy nghĩ nào nữa không?", 500);
    const wrap = document.createElement('div'); wrap.className = 'cloud-wrapper ' + (Math.random()>0.5?'flying-right':'flying-left');
    wrap.style.marginTop = `${Math.floor(Math.random()*60)-30}px`;
    const body = document.createElement('div'); body.className = 'cloud-body'; body.innerText = txt;
    body.style.setProperty('--cloud-color', cloudColors[Math.floor(Math.random()*cloudColors.length)]);
    wrap.appendChild(body); document.getElementById('stage-5').appendChild(wrap);
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
inputContainerCloud.addEventListener('click', e => e.stopPropagation());

/* --- STAGE 6: JAR --- */
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
    // (Tùy chọn) Bắt buộc nhập mới cho qua
    if(msg === "") { alert("Chị hãy viết vài dòng nhé!"); return; }
    currentUser.jarNote = msg;

    // 1. Ẩn màn hình viết
    writeJar.style.opacity = '0';
    
    setTimeout(() => {
        writeJar.style.display = 'none';
        
        // 2. Hiện màn hình cái hũ
        jarScreenFinal.style.display = 'flex'; 
        
        // 3. Bắt đầu hiệu ứng rơi
        triggerDroppingHeart(); 
    }, 500);
}
function triggerDroppingHeart() {
    // Tạo phần tử trái tim bay
    const flyingHeart = document.createElement('div');
    flyingHeart.classList.add('falling-heart', 'animate-drop');
    
    // Gắn vào màn hình hũ
    jarScreenFinal.appendChild(flyingHeart);

    // Sau khi rơi xong (1.5 giây)
    setTimeout(() => {
        // Xóa trái tim bay
        flyingHeart.remove();

        // Tạo trái tim nằm yên trong hũ
        const landedHeart = document.createElement('div');
        landedHeart.className = 'heart-in-jar';
        
        // Random vị trí một chút cho tự nhiên (nếu muốn)
        // landedHeart.style.left = (40 + Math.random() * 20) + '%';
        
        jar.appendChild(landedHeart);

        // Hiện thông báo chúc mừng & Nút tiếp tục
        finalMsg.style.opacity = "1";
        contBtnJar.style.display = "block";
        setTimeout(() => contBtnJar.style.opacity = "1", 100);
        
        // Hiệu ứng rung nhẹ báo hiệu đã nhận
        if(navigator.vibrate) navigator.vibrate([50, 100, 50]);

    }, 1400); // Khớp với thời gian animation CSS (1.5s)
}
function finishJourney() {
    // 1. Lấy cảm xúc cuối cùng
    const finalSlider = document.getElementById('final-range');
    if(finalSlider && typeof emotionLevels !== 'undefined') {
        const val = parseInt(finalSlider.value);
        currentUser.finalMood = emotionLevels[val] ? emotionLevels[val].text : val;
    }

    currentUser.created_at = new Date().toISOString();

    // 2. Vẫn lưu Offline để người chơi tự xem lại lịch sử (Nhật ký) trên máy của họ
    let history = JSON.parse(localStorage.getItem('myJourneys')) || [];
    history.push(currentUser);
    localStorage.setItem('myJourneys', JSON.stringify(history));

    console.log("Dữ liệu chuẩn bị gửi:", currentUser);

    // 3. --- GỬI TOÀN BỘ DỮ LIỆU LÊN GOOGLE SHEETS ---
    // ĐỔI ĐƯỜNG LINK CỦA BẠN VÀO DÒNG BÊN DƯỚI:
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZ6w63fwkEZSj4KdJH_DIYq6unkdJfb5ssKGNzgs-rMrH2cZ-9fvjUdY4k5AVc8nF6/exec";

    // Vô hiệu hóa nút và đổi chữ để người chơi biết đang lưu
    const btn = document.querySelector('#stage-7 .btn-start');
    if (btn) {
        btn.innerText = "Đang lưu...";
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
    }

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Bắt buộc phải có cái này để không bị lỗi bảo mật (CORS) trình duyệt chặn
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentUser)
    })
    .then(() => {
        alert("Tuyệt vời! Hành trình bình an của chị đã được lưu lại.");
        location.reload(); 
    })
    .catch(error => {
        console.error("Lỗi khi gửi lên server: ", error);
        // Nếu lỡ rớt mạng vẫn thông báo hoàn thành
        alert("Đã hoàn thành! (Dữ liệu đã lưu tạm trên thiết bị do lỗi mạng).");
        location.reload();
    });
}
function goBack() {
    // TH1: Đang ở màn hình "Check-in Cảm xúc" -> Về Đăng nhập
    const emotionStage = document.getElementById('stage-emotion-check');
    if (emotionStage && emotionStage.classList.contains('active') && emotionStage.style.display !== 'none') {
        emotionStage.style.display = 'none';
        emotionStage.classList.remove('active');
        
        const stage0 = document.getElementById('stage-0');
        if(stage0) {
            stage0.style.display = 'flex';
            stage0.classList.add('active');
        }
        const modal = document.getElementById('welcome-modal');
        if(modal) {
            modal.style.display = 'block';
            modal.style.opacity = '1';
        }
        return;
    }

    // Xác định đang ở Stage mấy
    let currentId = -1;
    for(let i=1; i<=6; i++) {
        const s = document.getElementById('stage-'+i);
        if(s && s.classList.contains('active')) {
            currentId = i; break;
        }
    }

    // --- XỬ LÝ CÁC TRƯỜNG HỢP ---

    // Đang ở Stage 1 -> Về Check-in Cảm xúc
    if (currentId === 1) {
        document.getElementById('stage-1').classList.remove('active');
        document.getElementById('stage-1').style.display = 'none';
        if(typeof stopGame === 'function') stopGame(); 

        if (emotionStage) {
            emotionStage.style.display = 'flex';
            emotionStage.classList.add('active');
        }
        return;
    }

    // Đang ở Stage 4 (Capybara)
    if (currentId === 4) {
        const feedback = document.getElementById('feedback-screen');
        const selection = document.getElementById('selection-screen');

        // Nếu đang hiện Feedback "Cảm ơn..." -> Quay lại bảng chọn
        if (feedback && window.getComputedStyle(feedback).display !== 'none') {
            feedback.style.display = 'none';
            if(selection) {
                selection.style.display = 'block';
                selection.style.opacity = '1';
                selection.style.pointerEvents = 'auto';
            }
            return; 
        }
        
        // Nếu đang ở bảng chọn -> Quay lại Stage 3 (Màn hình Chúc mừng)
        switchStage(3);
        
        // QUAN TRỌNG: Ép Stage 3 hiện ngay trạng thái hoàn thành
        setTimeout(() => {
            if(typeof finishGameBody === 'function') finishGameBody();
        }, 50); 
        return;
    }

    // Các trường hợp khác (Lùi 1 bước)
    if (currentId > 1) {
        switchStage(currentId - 1);
    } else {
        // Về trang chủ
        switchStage(0);
        const modal = document.getElementById('welcome-modal');
        if(modal) {
            modal.style.display = 'block';
            setTimeout(() => modal.style.opacity = '1', 10);
        }
    }
}

window.selectEmotion = function(name) {
    console.log("Đã bấm vào:", name); // Kiểm tra xem bấm ăn chưa

    // 1. Lưu dữ liệu
    if (typeof currentUser !== 'undefined') {
        currentUser.capybaraMood = name;
    }

    // 2. Chuyển màn hình
    const selectionScreen = document.getElementById('selection-screen');
    const feedbackScreen = document.getElementById('feedback-screen');

    if (selectionScreen && feedbackScreen) {
        selectionScreen.style.display = 'none'; // Ẩn bảng chọn
        feedbackScreen.style.display = 'block'; // Hiện lời nhắn
        
        // Hiệu ứng hiện dần
        setTimeout(function() {
            feedbackScreen.style.opacity = '1';
        }, 50);
    } else {
        alert("Lỗi: Không tìm thấy màn hình tiếp theo. Hãy kiểm tra ID trong HTML.");
    }
}


// --- CẤU HÌNH ADMIN ---
const ADMIN_PHONE = "0967791552"; // Số điện thoại chìa khóa

// --- 1. SỬA HÀM CHECK PHONE (TẠO LỐI ĐI BÍ MẬT) ---
function checkPhone() {
    const phoneInput = document.getElementById('input-phone');
    const val = phoneInput.value.trim();
    
    if (!val || val.length < 9) {
        alert("Vui lòng nhập số điện thoại hợp lệ ạ!");
        return;
    }

    // 🔥 KIỂM TRA ADMIN: Nếu là số của Sang -> Mở bảng Admin ngay!
    if (val === ADMIN_PHONE) {
        openAdminPanel(); // Gọi hàm mở admin
        return; // Dừng lại, không cho chơi game
    }

    // --- Nếu là người thường thì chạy tiếp logic cũ ---
    currentUser.phone = val;
    console.log("Khách thường:", val);

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

// --- 2. CÁC HÀM XỬ LÝ ADMIN (THÊM VÀO CUỐI FILE) ---

function openAdminPanel() {
    const modal = document.getElementById('admin-modal');
    modal.style.display = 'block';
    fetchHistory(); // Tự động tải dữ liệu luôn
}

function closeAdmin() {
    document.getElementById('admin-modal').style.display = 'none';
    // Xóa ô nhập để người khác không nhìn thấy số
    document.getElementById('input-phone').value = ""; 
}

function fetchHistory() {
    // Gọi API với mật khẩu là số điện thoại Admin
    fetch(`http://localhost:3000/api/history?secret=${ADMIN_PHONE}`)
    .then(res => {
        if(res.status === 403) {
            alert("Không có quyền truy cập!");
            return [];
        }
        return res.json();
    })
    .then(data => {
        const tbody = document.getElementById('admin-table-body');
        tbody.innerHTML = ""; // Xóa dữ liệu cũ
        
        // Nếu không có dữ liệu
        if(data.length === 0) {
            // colspan=9 vì bảng bây giờ có 9 cột (tính cả nút xóa)
            tbody.innerHTML = "<tr><td colspan='9' style='text-align:center; padding:20px; color: #888;'>Chưa có ai chơi cả (hoặc đã xóa hết) :(</td></tr>";
            return;
        }

        data.forEach(row => {
            const dateStr = new Date(row.created_at).toLocaleString('vi-VN');
            
            const tr = `
                <tr style="border-bottom: 1px solid #eee; hover:background-color: #f9f9f9;">
                    <td style="padding:10px;">${dateStr}</td>
                    <td style="padding:10px;"><b>${row.name}</b></td>
                    <td style="padding:10px;">${row.phone}</td>
                    <td style="padding:10px;">${row.initial_mood || '-'}</td>
                    <td style="padding:10px;">${row.capybara_mood || '-'}</td>
                    
                    <td style="padding:10px; color:#555; max-width: 200px; white-space: normal; word-wrap: break-word;">
                        ${row.cloud_thought || '-'}
                    </td>

                    <td style="padding:10px; color:#1565c0; max-width: 250px; white-space: normal; word-wrap: break-word;">
                        "${row.jar_note || ''}"
                    </td>

                    <td style="padding:10px; font-weight:bold;">${row.final_mood || '-'}</td>

                    <td style="padding:10px; text-align: center;">
                        <button onclick="deleteJourney(${row.id})" 
                                style="background: #ef5350; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                            Xóa
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += tr;
        });
    })
    .catch(err => {
        console.error(err);
        alert("Lỗi kết nối Server! Nhớ bật 'node server.js' nhé.");
    });
}
function showMyHistory() {
    const modal = document.getElementById('my-history-modal');
    const content = document.getElementById('my-history-content');
    
    modal.style.display = 'block'; 

    // 1. Lấy dữ liệu từ Local Storage
    let history = JSON.parse(localStorage.getItem('myJourneys')) || [];

    // 2. Kiểm tra nếu chưa có gì
    if (history.length === 0) {
        content.innerHTML = "<p style='text-align:center; padding: 20px;'>Chị chưa có dòng nhật ký nào trên thiết bị này. Hãy chơi thử nhé!</p>";
        return;
    }

    // Đảo ngược để hiện cái mới nhất lên đầu
    history.reverse();

    // 3. Tạo danh sách hiển thị
    let html = "";
    history.forEach(row => {
        const date = new Date(row.created_at).toLocaleString('vi-VN');
        
        html += `
            <div style="background: #fff; padding: 20px; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-left: 6px solid #009688;">
                <div style="font-size: 0.9em; color: #888; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    📅 ${date}
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; background: #f9f9f9; padding: 10px; border-radius: 8px;">
                    <div>🌱 <b>Đầu:</b> ${row.initialMood || '...'}</div>
                    <div>✨ <b>Cuối:</b> <span style="color: #e91e63; font-weight:bold;">${row.finalMood || '...'}</span></div>
                </div>
                
                <p>🦁 <b>Bé Capybara:</b> ${row.capybaraMood || '...'}</p>
                <p>☁️ <b>Suy nghĩ:</b> <i>"${row.cloudThought || '...'}"</i></p>

                <div style="background: #e0f2f1; padding: 10px; border-radius: 8px; margin-top: 10px; color: #004d40;">
                    💌 <b>Lời nhắn:</b><br>"${row.jarNote || '...'}"
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
}

function closeMyHistory() {
    document.getElementById('my-history-modal').style.display = 'none';
}
function deleteJourney(id) {
    if (!confirm("Bạn có chắc muốn xóa dòng này khỏi bảng Admin không?\n(Yên tâm, người dùng vẫn xem lại được nhật ký này)")) {
        return;
    }

    fetch('http://localhost:3000/api/hide-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
    .then(res => {
        if (res.ok) {
            alert("Đã xóa khỏi danh sách quản lý!");
            fetchHistory(); // Tải lại bảng để thấy nó biến mất
        } else {
            alert("Lỗi rồi, chưa xóa được!");
        }
    })
    .catch(err => console.error(err));
}



