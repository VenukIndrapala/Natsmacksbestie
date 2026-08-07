/* tree.js */
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

// Click prompt click handler: precisely grabs button position and begins sequence
clickPrompt.addEventListener('click', (e) => {
    const rect = clickPrompt.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    clickPrompt.style.opacity = '0';
    setTimeout(() => {
        clickPrompt.style.display = 'none';
        startExactVideoReplication(startX, startY);
    }, 400);
});

function startExactVideoReplication(btnX, btnY) {
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
    let groundY = height - 160;
    let targetGroundX = width / 2;

    let trunkProgress = 0;
    let targetTrunkHeight = 150;

    let mainBranches = [];
    let subBranches = [];
    let heartTargets = [];
    let scheduledHearts = [];
    let activeHearts = [];
    let interactiveFallingHearts = [];

    const trunkColor = "#8d5b4c"; // Clean natural brown wood tone matching the video reference

    function drawDot(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawHeartShape(x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 12, size / 12);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.bezierCurveTo(-5, -3, -12, 2, -6, 9);
        ctx.bezierCurveTo(-3, 12, 0, 14, 0, 15);
        ctx.bezierCurveTo(0, 14, 3, 12, 6, 9);
        ctx.bezierCurveTo(12, 2, 5, -3, 0, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Perfectly structured straight vertical brown trunk matching the reference video style
    function drawTrunk(progress) {
        ctx.strokeStyle = trunkColor;
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(targetGroundX, groundY);
        
        let currentH = targetTrunkHeight * progress;
        ctx.lineTo(targetGroundX, groundY - currentH);
        ctx.stroke();

        return { x: targetGroundX, y: groundY - currentH };
    }

    // Clean organized structural branch generator matching the exact geometry of the reference video
    class BranchLine {
        constructor(x1, y1, x2, y2, width) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.width = width;
            this.progress = 0;
        }

        update() {
            if (this.progress < 1) {
                this.progress += 0.08;
            }
        }

        draw() {
            let currentX = this.x1 + (this.x2 - this.x1) * Math.min(this.progress, 1);
            let currentY = this.y1 + (this.y2 - this.y1) * Math.min(this.progress, 1);

            ctx.strokeStyle = trunkColor;
            ctx.lineWidth = this.width;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
        }
    }

    class TreeHeart {
        constructor(startX, startY, targetX, targetY) {
            this.cx = startX;
            this.cy = startY;
            this.tx = targetX;
            this.ty = targetY;
            this.progress = 0;
            this.speed = 0.08;
            this.size = Math.random() * 2.5 + 7.5;
            
            // Rich pink and red spectrum matching the video hearts
            const hues = [340, 345, 350, 355, 0, 5];
            this.color = `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 85%, 62%)`;
        }

        update() {
            if (this.progress < 1) {
                this.progress += this.speed;
                this.cx += (this.tx - this.cx) * 0.25;
                this.cy += (this.ty - this.cy) * 0.25;
            }
        }

        draw() {
            drawHeartShape(this.cx, this.cy, this.size, this.color);
        }
    }

    class FallingHeart {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = Math.random() * 2 + 2;
            this.size = 11;
            this.color = color;
            this.rotation = Math.random() * Math.PI;
            this.vRot = (Math.random() - 0.5) * 0.05;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.15;
            this.rotation += this.vRot;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            drawHeartShape(0, 0, this.size, this.color);
            ctx.restore();
        }
    }

    // Precise heart canopy outline mapping the exact silhouette from the reference video
    for (let i = 0; i < 350; i++) {
        let t = (i / 350) * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        let fillFactor = Math.random();
        heartTargets.push({
            x: targetGroundX + x * 10.2 * Math.sqrt(fillFactor),
            y: (groundY - targetTrunkHeight - 110) + y * 10.2 * Math.sqrt(fillFactor)
        });
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = 0; i < 15; i++) {
            let sourceHeart = activeHearts.length > 0 ? activeHearts[Math.floor(Math.random() * activeHearts.length)] : {cx: clickX, cy: clickY, color: '#e91e63'};
            interactiveFallingHearts.push(new FallingHeart(sourceHeart.cx, sourceHeart.cy, sourceHeart.color));
        }
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Clean ground baseline line matching the video
        ctx.strokeStyle = "#e91e63";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 320, groundY);
        ctx.lineTo(width / 2 + 320, groundY);
        ctx.stroke();

        if (state === 'FALLING_DOT') {
            // Step 1: Red dot falling from prompt button down to the center ground position
            drawDot(dotX, dotY, 6, "#e91e63");
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#e91e63";
            drawDot(dotX, dotY, 6, "#e91e63");
            ctx.shadowBlur = 0;

            dotY += (groundY - dotY) * 0.16;
            dotX += (targetGroundX - dotX) * 0.16;

            if (Math.abs(dotY - groundY) < 3.5) {
                state = 'GROWING_TRUNK';
            }
        } 
        else if (state === 'GROWING_TRUNK') {
            // Step 2: Straight trunk grows organically upwards from the ground line
            if (trunkProgress < 1) {
                trunkProgress += 0.045;
            } else {
                state = 'GROWING_BRANCHES';
                let topTip = drawTrunk(1);
                
                // Structured organized side branches mirroring the reference video layout
                let tipX = topTip.x;
                let tipY = topTip.y;

                mainBranches.push(new BranchLine(tipX, tipY, tipX - 65, tipY - 45, 9));
                mainBranches.push(new BranchLine(tipX, tipY, tipX + 65, tipY - 45, 9));
                mainBranches.push(new BranchLine(tipX, tipY, tipX - 40, tipY - 75, 8));
                mainBranches.push(new BranchLine(tipX, tipY, tipX + 40, tipY - 75, 8));
                mainBranches.push(new BranchLine(tipX, tipY, tipX, tipY - 85, 8));
            }

            drawTrunk(trunkProgress);
        } 
        else if (state === 'GROWING_BRANCHES') {
            drawTrunk(1);
            
            let allMainDone = true;
            mainBranches.forEach(b => {
                b.update();
                b.draw();
                if (b.progress < 1) allMainDone = false;
            });

            if (allMainDone && subBranches.length === 0) {
                mainBranches.forEach(mb => {
                    subBranches.push(new BranchLine(mb.x2, mb.y2, mb.x2 - 35, mb.y2 - 30, 5));
                    subBranches.push(new BranchLine(mb.x2, mb.y2, mb.x2 + 35, mb.y2 - 30, 5));
                });
            }

            let allSubDone = true;
            subBranches.forEach(sb => {
                sb.update();
                sb.draw();
                if (sb.progress < 1) allSubDone = false;
            });

            if (allMainDone && allSubDone && scheduledHearts.length === 0) {
                let allTerminals = [];
                mainBranches.forEach(mb => allTerminals.push({ x: mb.x2, y: mb.y2 }));
                subBranches.forEach(sb => allTerminals.push({ x: sb.x2, y: sb.y2 }));

                heartTargets.forEach(target => {
                    let src = allTerminals.length > 0 ? allTerminals[Math.floor(Math.random() * allTerminals.length)] : { x: targetGroundX, y: groundY - targetTrunkHeight };
                    scheduledHearts.push(new TreeHeart(src.x, src.y, target.x, target.y));
                });
                state = 'BLOOMING_HEARTS';
            }
        } 
        else if (state === 'BLOOMING_HEARTS') {
            drawTrunk(1);
            mainBranches.forEach(b => b.draw());
            subBranches.forEach(b => b.draw());

            // Step 3: Hearts blossom smoothly and form the dense heart canopy shape
            let batchSize = 10;
            for (let i = 0; i < batchSize && scheduledHearts.length > 0; i++) {
                activeHearts.push(scheduledHearts.shift());
            }

            activeHearts.forEach(h => {
                h.update();
                h.draw();
            });
        }

        interactiveFallingHearts.forEach((fh, index) => {
            fh.update();
            fh.draw();
            if (fh.y > height + 50) {
                interactiveFallingHearts.splice(index, 1);
            }
        });

        requestAnimationFrame(animate);
    }
    animate();

    const loveMessage = document.getElementById('loveMessage');
    const messages = [
        "Mi amor por ti comenzó hace...",
        "Mi amor por ti comenzó hace...<br>105 días 13 horas 15 minutes",
        "¡Feliz Día de la Novia, mi amor! ✨",
        "Hoy 1 de agosto celebro lo afortunado que soy de tenerte.",
        "Si pudiera elegir un lugar seguro, sería siempre a tu lado.",
        "Cuanto más tiempo estoy contigo, más te amo... ♡"
    ];

    let msgIndex = 0;
    function showMessages() {
        if (msgIndex < messages.length) {
            loveMessage.innerHTML = messages[msgIndex];
            loveMessage.style.opacity = 1;
            msgIndex++;
            setTimeout(showMessages, 3800);
        }
    }
    setTimeout(showMessages, 3000);
}
