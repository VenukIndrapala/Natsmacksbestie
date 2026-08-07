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

// --- Unchanged Lamp Logic ---
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
        body.style.backgroundColor = "#fce4ec";
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

// --- Exact Video Replication Code (Dot + Ground + Seamless Organic Tree) ---
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
    
    // Core Layout
    let targetGroundX = width / 2;
    let groundY = height - 120;
    const trunkColor = "#744527"; // Exact rich brown from the target image

    // Draws organic, flawlessly tapering branches using dense microscopic circles along a Cubic Bézier curve
    class CubicBranch {
        constructor(sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, w0, w1, delay) {
            const scale = 1.35; // Global scale to ensure the tree matches the screen presence
            
            this.p0 = { x: sx * scale, y: sy * scale };
            this.p1 = { x: cp1x * scale, y: cp1y * scale };
            this.p2 = { x: cp2x * scale, y: cp2y * scale };
            this.p3 = { x: ex * scale, y: ey * scale };
            this.w0 = w0 * scale;
            this.w1 = w1 * scale;
            this.delay = delay;
            this.progress = 0;
            this.speed = 0.012; // Slow, natural unrolling speed
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
            
            // High density step count guarantees completely smooth edges without jagged breaks
            let steps = Math.floor(300 * this.progress); 
            ctx.fillStyle = trunkColor;
            
            for (let i = 0; i <= steps; i++) {
                let t = i / 300;
                let invT = 1 - t;
                
                // Standard Cubic Bezier Equation
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
        // Precise topological mapping of "image_01d3ff.png" 
        // Format: startX, startY, control1X, control1Y, control2X, control2Y, endX, endY, startWidth, endWidth, delay

        // 1. Main Trunk (Slight lean, tapering up to the Y split)
        branches.push(new CubicBranch(0, 0, -2, -40, -4, -80, -5, -120, 22, 13, 0));
        
        // 2. Lowest Right Branch (Long graceful sweeping arc right)
        branches.push(new CubicBranch(2, -30, 40, -35, 80, -50, 120, -90, 7.5, 0.5, 20));
        
        // 3. Lowest Left Branch
        branches.push(new CubicBranch(-4, -60, -40, -65, -80, -75, -115, -110, 6.5, 0.5, 40));
        
        // 4. Middle Right Branch
        branches.push(new CubicBranch(-1, -85, 30, -95, 60, -110, 95, -140, 5, 0.5, 55));
        
        // 5. Left Main Split (The left half of the upper Y)
        branches.push(new CubicBranch(-5, -119, -20, -160, -40, -190, -65, -220, 13, 1, 80));
        
        // 6. Right Main Split (The right half of the upper Y)
        branches.push(new CubicBranch(-5, -119, 15, -160, 25, -200, 45, -230, 13, 1, 80));
        
        // 7. Outer Sub-branch off Left Main
        branches.push(new CubicBranch(-25, -168, -50, -170, -80, -175, -100, -190, 4.5, 0.5, 105));
        
        // 8. Inner Sub-branch off Left Main (Shooting mostly straight up)
        branches.push(new CubicBranch(-45, -200, -45, -220, -42, -240, -40, -270, 3.5, 0.5, 120));
        
        // 9. Outer Sub-branch off Right Main
        branches.push(new CubicBranch(15, -170, 40, -175, 65, -185, 85, -200, 4.5, 0.5, 105));
        
        // 10. Inner Sub-branch off Right Main (Shooting mostly straight up)
        branches.push(new CubicBranch(25, -200, 20, -220, 15, -240, 10, -270, 3.5, 0.5, 120));
    }

    function drawDot(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw the exact solid ground line seen in the reference image
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

            // Allow the dot to sink just below the surface line before starting growth
            if (dotY >= groundY + 2) {
                state = 'GROWING_TREE';
                setupBranches(); 
            }
        } 
        else if (state === 'GROWING_TREE') {
            branches.forEach(branch => {
                branch.update();
                // We sink the origin 2 pixels down so the trunk base sits flush on the horizontal line
                branch.draw(ctx, targetGroundX, groundY + 2);
            });
        }

        requestAnimationFrame(animate);
    }
    animate();
}
