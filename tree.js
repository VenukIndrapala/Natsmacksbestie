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
        body.style.backgroundColor = "#000";
        videoAnimationScene.classList.add('active');

        if (audioElement) {
            audioElement.play().catch(err => console.log("Audio autoplay prevented:", err));
        }
    } else {
        alert("Incorrect password! Try again.");
        passwordInput.value = "";
    }
});

// Clicking the prompt triggers the exact falling heart animation from the button position
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

    let state = 'FALLING_HEART';
    let heartX = btnX;
    let heartY = btnY;
    let groundY = height - 140;
    let targetGroundX = width / 2;

    let trunkProgress = 0;
    let targetTrunkHeight = 130;

    let rootBranch = null;
    let heartTargets = [];
    let scheduledHearts = [];
    let activeHearts = [];
    let interactiveFallingHearts = [];

    const treeColor = "#ffb6c1";

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

    // Curved Trunk calculation matching the reference video curve
    function drawCurvedTrunk(progress) {
        ctx.strokeStyle = treeColor;
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(targetGroundX, groundY);
        
        // Quadratic curve creating the organic lean/curve
        let currentH = targetTrunkHeight * progress;
        let controlX = targetGroundX - 25 * progress;
        let controlY = groundY - currentH * 0.5;
        let endX = targetGroundX - 10 * progress;
        let endY = groundY - currentH;

        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.stroke();

        return { x: endX, y: endY };
    }

    class Branch {
        constructor(x, y, length, angle, thickness, gen) {
            this.x = x;
            this.y = y;
            this.length = length;
            this.angle = angle;
            this.thickness = thickness;
            this.gen = gen;
            this.progress = 0;
            this.children = [];
            this.hasChild = false;
        }

        update() {
            if (this.progress < 1) {
                this.progress += 0.05;
            } else if (!this.hasChild && this.gen < 5) {
                this.hasChild = true;
                let endX = this.x + Math.cos(this.angle) * this.length;
                let endY = this.y + Math.sin(this.angle) * this.length;
                this.children.push(new Branch(endX, endY, this.length * 0.75, this.angle - 0.45, this.thickness * 0.7, this.gen + 1));
                this.children.push(new Branch(endX, endY, this.length * 0.75, this.angle + 0.45, this.thickness * 0.7, this.gen + 1));
            }
            this.children.forEach(c => c.update());
        }

        draw() {
            let currentLen = this.length * Math.min(this.progress, 1);
            let endX = this.x + Math.cos(this.angle) * currentLen;
            let endY = this.y + Math.sin(this.angle) * currentLen;

            ctx.strokeStyle = treeColor;
            ctx.lineWidth = this.thickness;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            this.children.forEach(c => c.draw());
        }

        getTerminals(list) {
            let endX = this.x + Math.cos(this.angle) * this.length;
            let endY = this.y + Math.sin(this.angle) * this.length;
            if (this.children.length === 0) {
                list.push({ x: endX, y: endY });
            } else {
                this.children.forEach(c => c.getTerminals(list));
            }
        }
    }

    class TreeHeart {
        constructor(startX, startY, targetX, targetY) {
            this.x = startX;
            this.y = startY;
            this.tx = targetX;
            this.ty = targetY;
            this.cx = startX;
            this.cy = startY;
            this.progress = 0;
            this.speed = 0.08;
            this.size = Math.random() * 3 + 7;
            
            const hues = [340, 350, 15, 30, 45, 320];
            this.color = `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 100%, 70%)`;
        }

        update() {
            if (this.progress < 1) {
                this.progress += this.speed;
                this.cx += (this.tx - this.cx) * 0.2;
                this.cy += (this.ty - this.cy) * 0.2;
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

    // Pre-calculate heart canopy layout positions
    for (let i = 0; i < 380; i++) {
        let t = (i / 380) * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        let fillFactor = Math.random();
        heartTargets.push({
            x: targetGroundX + x * 10.5 * Math.sqrt(fillFactor),
            y: (groundY - targetTrunkHeight - 105) + y * 10.5 * Math.sqrt(fillFactor)
        });
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = 0; i < 15; i++) {
            let sourceHeart = activeHearts.length > 0 ? activeHearts[Math.floor(Math.random() * activeHearts.length)] : {cx: clickX, cy: clickY, color: '#ffb6c1'};
            interactiveFallingHearts.push(new FallingHeart(sourceHeart.cx, sourceHeart.cy, sourceHeart.color));
        }
    });

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, height);

        // Ground baseline
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 320, groundY);
        ctx.lineTo(width / 2 + 320, groundY);
        ctx.stroke();

        if (state === 'FALLING_HEART') {
            // Heart falling from click prompt position down to baseline
            drawHeartShape(heartX, heartY, 12, "#ffb6c1");
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffb6c1";
            drawHeartShape(heartX, heartY, 12, "#ffb6c1");
            ctx.shadowBlur = 0;

            heartY += (groundY - heartY) * 0.15;
            heartX += (targetGroundX - heartX) * 0.15;

            if (Math.abs(heartY - groundY) < 4) {
                state = 'GROWING_TRUNK';
            }
        } 
        else if (state === 'GROWING_TRUNK') {
            if (trunkProgress < 1) {
                trunkProgress += 0.04;
            } else {
                state = 'BRANCHING';
                let topTip = drawCurvedTrunk(1);
                rootBranch = new Branch(topTip.x, topTip.y, 85, -Math.PI / 2 - 0.15, 12, 1);
            }

            drawCurvedTrunk(trunkProgress);
        } 
        else if (state === 'BRANCHING') {
            let topTip = drawCurvedTrunk(1);
            rootBranch.update();
            rootBranch.draw();

            if (rootBranch.progress >= 1 && rootBranch.children.length > 0 && scheduledHearts.length === 0) {
                let terminals = [];
                rootBranch.getTerminals(terminals);

                heartTargets.forEach(target => {
                    let src = terminals.length > 0 ? terminals[Math.floor(Math.random() * terminals.length)] : { x: topTip.x, y: topTip.y };
                    scheduledHearts.push(new TreeHeart(src.x, src.y, target.x, target.y));
                });
                state = 'BLOOMING_HEARTS';
            }
        } 
        else if (state === 'BLOOMING_HEARTS') {
            drawCurvedTrunk(1);
            rootBranch.draw();

            // Pop hearts up in a gradual sequence rather than all at once
            let batchSize = 12;
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
        "hey you :)",
        "hey you :)<br>Happy Birthday !",
        "hey you :)<br>Happy Birthday !<br>May God bless you",
        "hey you :)<br>Happy Birthday !<br>May God bless you ✨<br>And give u many happiness ✨",
        "hey you :)<br>Happy Birthday !<br>May God bless you ✨<br>And give u many happiness ✨<br>Just saying... you're pretty awesome ✨",
        "hey you :)<br>Happy Birthday !<br>May God bless you ✨<br>And give u many happiness ✨<br>Just saying... you're pretty awesome ✨<br>sending good vibes<br>and maybe a kiss... ♡"
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
