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

// --- Trigger Animation Logic ---
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

// --- Exact Video Replication Code (Dot + Trunk + Branches Only) ---
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
    
    // Dot variables
    let dotX = btnX;
    let dotY = btnY;
    
    // Layout anchor points
    let groundY = height - 120; // Exact baseline where the trunk hits the floor
    let targetGroundX = width / 2; // Center of screen
    
    // Trunk variables
    let trunkProgress = 0;
    let targetTrunkHeight = 180;
    const trunkColor = "#774E39"; // Deep brown matching the video

    // Branch drawing utility to create smooth, tapering bezier curves
    class BezierBranch {
        constructor(startX, startY, cpX, cpY, endX, endY, startWidth, endWidth, delay) {
            this.sx = startX;
            this.sy = startY;
            this.cpx = cpX;
            this.cpy = cpY;
            this.ex = endX;
            this.ey = endY;
            this.sw = startWidth;
            this.ew = endWidth;
            this.delay = delay;
            this.progress = 0;
            this.speed = 0.035; 
        }

        update() {
            if (this.delay > 0) {
                this.delay--;
                return;
            }
            if (this.progress < 1) {
                this.progress += this.speed;
            }
        }

        // Draw the curve progressively using small segments to allow smooth tapering
        draw(ctx) {
            if (this.progress <= 0) return;

            let steps = Math.floor(50 * this.progress);
            if (steps < 1) steps = 1;

            ctx.fillStyle = trunkColor;

            for (let i = 0; i <= steps; i++) {
                let t = i / 50; 
                let invT = 1 - t;

                // Quadratic Bezier interpolation
                let currX = invT * invT * this.sx + 2 * invT * t * this.cpx + t * t * this.ex;
                let currY = invT * invT * this.sy + 2 * invT * t * this.cpy + t * t * this.ey;
                
                // Interpolate width so the branch gets thinner towards the tip
                let currWidth = this.sw - ((this.sw - this.ew) * t);

                ctx.beginPath();
                ctx.arc(currX, currY, currWidth / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    let branches = [];

    function setupBranches() {
        let tX = targetGroundX;
        let tY = groundY - targetTrunkHeight; // Top of the trunk

        // Hardcoded exact replica layout from the 00:02 mark of the video
        
        // 1. Main Left Branch (curves out left and up)
        branches.push(new BezierBranch(tX, tY + 10, tX - 50, tY - 40, tX - 90, tY - 60, 10, 2, 0));
        
        // 2. Main Right Branch (curves out right and up)
        branches.push(new BezierBranch(tX, tY + 10, tX + 60, tY - 50, tX + 100, tY - 70, 10, 2, 0));
        
        // 3. Lower Left Branch (sprouts lower on trunk)
        branches.push(new BezierBranch(tX, tY + 60, tX - 60, tY + 40, tX - 80, tY - 10, 7, 1, 10));

        // 4. Middle Left Sub-branch (sprouts from left main branch)
        branches.push(new BezierBranch(tX - 40, tY - 20, tX - 45, tY - 60, tX - 60, tY - 90, 5, 1, 15));

        // 5. High Central Left Sub-branch
        branches.push(new BezierBranch(tX - 10, tY - 15, tX - 15, tY - 50, tX - 25, tY - 100, 4, 1, 15));

        // 6. High Central Right Sub-branch (sprouts from right main)
        branches.push(new BezierBranch(tX + 30, tY - 25, tX + 25, tY - 60, tX + 20, tY - 100, 6, 1, 15));

        // 7. Middle Right Sub-branch (sprouts from right main)
        branches.push(new BezierBranch(tX + 50, tY - 40, tX + 80, tY - 60, tX + 90, tY - 100, 5, 1, 20));
        
        // 8. Lower Right Sub-branch
        branches.push(new BezierBranch(tX + 25, tY + 40, tX + 70, tY + 20, tX + 110, tY - 10, 6, 1, 15));
    }

    function drawDot(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draws the trunk as a filled tapering polygon (wider at base, narrow at top)
    function drawTrunkPolygon(progress) {
        let currentHeight = targetTrunkHeight * progress;
        
        // Tapering parameters
        let baseHalfWidth = 14; 
        let topHalfWidth = 14 - (8 * progress); // Narrows smoothly as it grows up

        ctx.fillStyle = trunkColor;
        ctx.beginPath();
        
        // Bottom left corner
        ctx.moveTo(targetGroundX - baseHalfWidth, groundY);
        // Bottom right corner
        ctx.lineTo(targetGroundX + baseHalfWidth, groundY);
        // Top right corner
        ctx.lineTo(targetGroundX + topHalfWidth, groundY - currentHeight);
        // Top left corner
        ctx.lineTo(targetGroundX - topHalfWidth, groundY - currentHeight);
        
        ctx.closePath();
        ctx.fill();
        
        // Cap the top to ensure a smooth transition into branches
        ctx.beginPath();
        ctx.arc(targetGroundX, groundY - currentHeight, topHalfWidth, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        if (state === 'FALLING_DOT') {
            // Drop dot straight down
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#e91e63";
            drawDot(dotX, dotY, 6, "#e91e63");
            ctx.shadowBlur = 0;

            dotY += 12; // Flat velocity downward
            dotX += (targetGroundX - dotX) * 0.1; // Smooth out x-axis quickly to center

            if (dotY >= groundY) {
                state = 'GROWING_TRUNK';
            }
        } 
        else if (state === 'GROWING_TRUNK') {
            if (trunkProgress < 1) {
                trunkProgress += 0.035;
            } else {
                trunkProgress = 1;
                state = 'GROWING_BRANCHES';
                setupBranches(); // Initialize exact branches when trunk finishes
            }
            drawTrunkPolygon(trunkProgress);
        } 
        else if (state === 'GROWING_BRANCHES') {
            drawTrunkPolygon(1);
            
            branches.forEach(branch => {
                branch.update();
                branch.draw(ctx);
            });
            // Stop here for this step. No hearts. No text.
        }

        requestAnimationFrame(animate);
    }
    animate();
}
