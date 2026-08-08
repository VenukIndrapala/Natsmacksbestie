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
        // Trunk, ending at the crown fork point (-3,-175)
        branches.push(new CubicBranch(0, 0, 0, -60, -2, -120, -3, -175, 24, 10, 0));

        // --- Bottom four branches: sharp upward curve right at the trunk,
        // then straightening out toward the tip, angled upward overall
        // (no droop), spaced further apart so they don't cross each other.

        // Lower-left (longest, starts lowest of the pair)
        branches.push(new CubicBranch(-1, -88, -25, -114, -70, -107, -120, -111, 6, 0.1, 12));

        // Lower-right (shorter than lower-left)
        branches.push(new CubicBranch(-1, -83, 22, -107, 58, -99, 92, -102, 5.2, 0.1, 18));

        // Upper-left (starts higher on the trunk, clear of the lower-left branch)
        branches.push(new CubicBranch(-1.5, -122, -20, -142, -52, -136, -82, -140, 4.4, 0.1, 32));

        // Upper-right (shortest of the four)
        branches.push(new CubicBranch(-1.7, -117, 18, -136, 46, -131, 70, -134, 4, 0.1, 40));

        // --- Top three branches: asymmetric heights + more pronounced
        // curve, matching the reference (center tallest, left second,
        // right shortest).

        // Left branch -- tall, pronounced S-curve, small forked twig near the tip
        branches.push(new CubicBranch(-3, -175, -30, -206, -55, -246, -63, -276, 7, 2.4, 55));
        branches.push(new CubicBranch(-63, -276, -76, -288, -85, -298, -92, -306, 2.4, 0.1, 78));
        branches.push(new CubicBranch(-63, -276, -66, -290, -68, -302, -70, -313, 2.4, 0.1, 78));

        // Right branch -- shorter than left, gentler curve, small twig near the tip
        branches.push(new CubicBranch(-3, -175, 24, -197, 41, -217, 47, -234, 7, 2.4, 55));
        branches.push(new CubicBranch(47, -234, 59, -246, 68, -257, 75, -266, 2.4, 0.1, 78));
        branches.push(new CubicBranch(47, -234, 51, -248, 54, -260, 56, -271, 2.4, 0.1, 78));

        // Center -- tallest, reaches the top, splits into a tight V at the very tip
        branches.push(new CubicBranch(-3, -175, -2, -213, 3, -252, 6, -288, 5.2, 0.1, 55));
        branches.push(new CubicBranch(5, -266, -1, -280, -5, -294, -11, -306, 1.8, 0.1, 80));
        branches.push(new CubicBranch(5, -266, 10, -280, 15, -294, 19, -304, 1.8, 0.1, 80));
    }

    function drawDot(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

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
