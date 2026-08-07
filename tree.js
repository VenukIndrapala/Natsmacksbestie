const chainToggle = document.getElementById('chainToggle');
const loginCard = document.getElementById('loginCard');
const body = document.body;
const lampScene = document.getElementById('lampScene');
const videoAnimationScene = document.getElementById('videoAnimationScene');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const audioElement = document.getElementById('myAudio');
const clickPrompt = document.getElementById('clickPrompt');

const CORRECT_PASSWORD = "123";

// --- Authentication and Transition Logic ---
chainToggle.addEventListener('click', () => {
    chainToggle.classList.add('pull');
    setTimeout(() => {
        chainToggle.classList.remove('pull');
    }, 300);

    body.classList.toggle('active');
    loginCard.classList.toggle('active');
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
        lampScene.classList.add('hidden');
        body.classList.remove('active');
        body.style.backgroundColor = "#fce1e6";
        videoAnimationScene.classList.add('active');

        if (audioElement) {
            audioElement.play().catch(err => console.log("Audio autoplay prevented:", err));
        }
    } else {
        alert("Incorrect password! Try again.");
        passwordInput.value = "";
    }
});

clickPrompt.addEventListener('click', (e) => {
    const rect = clickPrompt.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    clickPrompt.style.opacity = '0';
    setTimeout(() => {
        clickPrompt.style.display = 'none';
        startExactTreeGrowth(startX, startY);
    }, 400);
});

// --- Refined Tree Animation Logic ---
function startExactTreeGrowth(btnX, btnY) {
    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let state = 'FALLING_DOT';
    
    let dotX = btnX;
    let dotY = btnY;
    
    let targetGroundX = width / 2;
    let groundY = height - 120;
    const trunkColor = "#864B24"; 

    class CubicBranch {
        constructor(sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, w0, w1, delay) {
            const scale = 1.35; 
            
            this.p0 = { x: sx * scale, y: sy * scale };
            this.p1 = { x: cp1x * scale, y: cp1y * scale };
            this.p2 = { x: cp2x * scale, y: cp2y * scale };
            this.p3 = { x: ex * scale, y: ey * scale };
            this.w0 = w0 * scale;
            this.w1 = w1 * scale;
            this.delay = delay;
            this.progress = 0;
            this.speed = 0.012; 
        }

        update() {
            if (this.delay > 0) {
                this.delay--;
                return;
            }
            if (this.progress < 1) {
                this.progress += this.speed;
                if (this.progress > 1) this.progress = 1;
            }
        }

        draw(ctx, offsetX, offsetY) {
            if (this.progress <= 0) return;
            
            let steps = Math.floor(300 * this.progress); 
            ctx.fillStyle = trunkColor;
            
            for (let i = 0; i <= steps; i++) {
                let t = i / 300;
                let invT = 1 - t;
                
                let x = invT*invT*invT*this.p0.x + 3*invT*invT*t*this.p1.x + 3*invT*t*t*this.p2.x + t*t*t*this.p3.x;
                let y = invT*invT*invT*this.p0.y + 3*invT*invT*t*this.p1.y + 3*invT*t*t*this.p2.y + t*t*t*this.p3.y;
                let w = this.w0 - (this.w0 - this.w1) * t;
                
                ctx.beginPath();
                ctx.arc(offsetX + x, offsetY + y, w / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    let branches = [];

    function setupBranches() {
        // EXACT TOPOLOGY OF THE CIRCLED TREE
        // Straighter curves, correct branch counts, angular positioning

        // 1. Main Trunk (Perfectly straight up)
        branches.push(new CubicBranch(0, 0, 0, -40, 0, -80, 0, -115, 23, 10, 0));

        // 2. Lower Right Branch (Starts flat, slightly curves up at the end)
        branches.push(new CubicBranch(0, -40, 40, -45, 80, -60, 120, -80, 7, 0.1, 15));

        // 3. Lower Left Branch (Starts flat, slightly curves up at the end)
        branches.push(new CubicBranch(0, -50, -40, -55, -80, -65, -120, -85, 7, 0.1, 20));

        // 4. Middle Right Branch (Steeper diagonal)
        branches.push(new CubicBranch(0, -75, 30, -95, 65, -115, 95, -135, 5.5, 0.1, 35));

        // 5. Middle Left Branch (Steeper diagonal)
        branches.push(new CubicBranch(0, -85, -30, -105, -65, -125, -95, -140, 5.5, 0.1, 40));

        // 6. Top Right V-Split (Mostly vertical)
        branches.push(new CubicBranch(0, -112, 15, -150, 25, -185, 35, -220, 9, 0.1, 55));

        // 7. Top Left V-Split (Mostly vertical)
        branches.push(new CubicBranch(0, -112, -10, -150, -20, -180, -30, -215, 9, 0.1, 55));

        // 8. Outer Sub-branch off Top Right
        branches.push(new CubicBranch(16, -155, 35, -165, 55, -180, 75, -195, 3.5, 0.1, 75));

        // 9. Outer Sub-branch off Top Left
        branches.push(new CubicBranch(-13, -150, -30, -160, -50, -175, -65, -190, 3.5, 0.1, 75));
    }

    function drawDot(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Ground line
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(width, groundY);
        ctx.stroke();

        if (state === 'FALLING_DOT') {
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#e91e63";
            drawDot(dotX, dotY, 6, "#e91e63");
            ctx.shadowBlur = 0;

            dotY += 12; 
            dotX += (targetGroundX - dotX) * 0.1; 

            if (dotY >= groundY) {
                state = 'GROWING_TREE';
                setupBranches(); 
            }
        } 
        else if (state === 'GROWING_TREE') {
            // Apply clipping to cut the trunk off perfectly flush at the ground line
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, width, groundY - 1); 
            ctx.clip();

            branches.forEach(branch => {
                branch.update();
                branch.draw(ctx, targetGroundX, groundY);
            });

            ctx.restore();
        }

        requestAnimationFrame(animate);
    }
    animate();
}
