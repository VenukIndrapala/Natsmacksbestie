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

clickPrompt.addEventListener('click', () => {
    clickPrompt.style.opacity = '0';
    setTimeout(() => {
        clickPrompt.style.display = 'none';
        startExactVideoReplication();
    }, 500);
});

function startExactVideoReplication() {
    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let state = 'FALLING_DOT';
    let dotY = height / 2 - 180;
    let groundY = height - 140;

    let trunkHeight = 0;
    let targetTrunkHeight = 130;

    let rootBranch = null;
    let hearts = [];
    let heartSpawned = false;
    let interactiveFallingHearts = [];

    const dotColor = "#ffb6c1";
    const trunkColor = "#ffb6c1";
    const branchColor = "#3d2b1f";

    // Fixed curve the trunk grows along: base -> control point -> top.
    // The control point pulls the trunk into a gentle bend, matching the
    // reference video, instead of a straight vertical line.
    function getTrunkCurvePoints() {
        return {
            p0: { x: width / 2, y: groundY },
            p1: { x: width / 2 - 38, y: groundY - targetTrunkHeight * 0.55 },
            p2: { x: width / 2 - 12, y: groundY - targetTrunkHeight }
        };
    }

    // De Casteljau subdivision: returns the control points of the partial
    // quadratic bezier from p0 up to parameter t, so the curve can be
    // animated growing smoothly along its own bend rather than snapping.
    function partialQuadratic(p0, p1, p2, t) {
        const q1 = { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
        const r0 = { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
        const q2 = { x: q1.x + (r0.x - q1.x) * t, y: q1.y + (r0.y - q1.y) * t };
        return { q0: p0, q1, q2 };
    }

    function pointOnQuadratic(p0, p1, p2, s) {
        const ax = p0.x + (p1.x - p0.x) * s;
        const ay = p0.y + (p1.y - p0.y) * s;
        const bx = p1.x + (p2.x - p1.x) * s;
        const by = p1.y + (p2.y - p1.y) * s;
        return { x: ax + (bx - ax) * s, y: ay + (by - ay) * s };
    }

    // Draws the trunk as a tapered, filled silhouette (wide at the base,
    // narrow at the top) following the curved path, revealing more of the
    // curve as `progress` (0..1) increases.
    function drawTrunk(progress) {
        const t = Math.min(Math.max(progress, 0), 1);
        const { p0, p1, p2 } = getTrunkCurvePoints();
        const partial = partialQuadratic(p0, p1, p2, t);

        const steps = 24;
        const baseHalfWidth = 12;
        const tipHalfWidth = 4;
        const leftPts = [];
        const rightPts = [];

        for (let i = 0; i <= steps; i++) {
            const s = i / steps;
            const pt = pointOnQuadratic(partial.q0, partial.q1, partial.q2, s);
            const nextS = Math.min(s + 0.01, 1);
            const nextPt = pointOnQuadratic(partial.q0, partial.q1, partial.q2, nextS);

            let dx = nextPt.x - pt.x;
            let dy = nextPt.y - pt.y;
            const len = Math.hypot(dx, dy) || 1;
            dx /= len;
            dy /= len;
            const perpX = -dy;
            const perpY = dx;

            const overallFrac = s * t;
            const halfWidth = baseHalfWidth + (tipHalfWidth - baseHalfWidth) * overallFrac;

            leftPts.push({ x: pt.x + perpX * halfWidth, y: pt.y + perpY * halfWidth });
            rightPts.push({ x: pt.x - perpX * halfWidth, y: pt.y - perpY * halfWidth });
        }

        ctx.fillStyle = trunkColor;
        ctx.beginPath();
        ctx.moveTo(leftPts[0].x, leftPts[0].y);
        for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
        for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
        ctx.closePath();
        ctx.fill();
    }

    // Helper to draw true geometric heart shapes matching the video
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
            // Fixed curvature for this branch, set once so the growth
            // animation bends smoothly instead of jittering each frame.
            this.bend = (Math.random() - 0.5) * 0.7;
        }

        getEndPoint() {
            return {
                x: this.x + Math.cos(this.angle) * this.length,
                y: this.y + Math.sin(this.angle) * this.length
            };
        }

        getControlPoint(end) {
            const midX = (this.x + end.x) / 2;
            const midY = (this.y + end.y) / 2;
            const perpAngle = this.angle + Math.PI / 2;
            const bendAmount = this.length * this.bend;
            return {
                x: midX + Math.cos(perpAngle) * bendAmount,
                y: midY + Math.sin(perpAngle) * bendAmount
            };
        }

        update() {
            if (this.progress < 1) {
                this.progress += 0.04;
            } else if (!this.hasChild && this.gen < 5) {
                this.hasChild = true;
                const end = this.getEndPoint();
                this.children.push(new Branch(end.x, end.y, this.length * 0.75, this.angle - 0.45, this.thickness * 0.7, this.gen + 1));
                this.children.push(new Branch(end.x, end.y, this.length * 0.75, this.angle + 0.45, this.thickness * 0.7, this.gen + 1));
            }
            this.children.forEach(c => c.update());
        }

        draw() {
            const t = Math.min(this.progress, 1);
            const end = this.getEndPoint();
            const control = this.getControlPoint(end);
            const partial = partialQuadratic({ x: this.x, y: this.y }, control, end, t);

            ctx.strokeStyle = branchColor;
            ctx.lineWidth = this.thickness;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(partial.q0.x, partial.q0.y);
            ctx.quadraticCurveTo(partial.q1.x, partial.q1.y, partial.q2.x, partial.q2.y);
            ctx.stroke();

            this.children.forEach(c => c.draw());
        }

        getTerminals(list) {
            const end = this.getEndPoint();
            if (this.children.length === 0) {
                list.push(end);
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
            this.speed = Math.random() * 0.035 + 0.025;
            this.size = Math.random() * 4 + 7;

            // Red / crimson / pink palette matching the reference video
            const hues = [345, 355, 0, 350, 5];
            const lightness = 40 + Math.random() * 35;
            this.color = `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 82%, ${lightness}%)`;
        }

        update() {
            if (this.progress < 1) {
                this.progress += this.speed;
                this.cx += (this.tx - this.cx) * 0.12;
                this.cy += (this.ty - this.cy) * 0.12;
            }
        }

        draw() {
            drawHeartShape(this.cx, this.cy, this.size, this.color);
        }
    }

    // Interactive Falling Heart Class triggered when clicking the tree/hearts
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

    let heartTargets = [];
    for (let i = 0; i < 450; i++) {
        let t = (i / 450) * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        let fillFactor = Math.random();
        const { p2 } = getTrunkCurvePoints();
        heartTargets.push({
            x: p2.x + x * 11 * Math.sqrt(fillFactor),
            y: (p2.y - 110) + y * 11 * Math.sqrt(fillFactor)
        });
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = 0; i < 15; i++) {
            let sourceHeart = hearts.length > 0 ? hearts[Math.floor(Math.random() * hearts.length)] : { cx: clickX, cy: clickY, color: '#ffb6c1' };
            interactiveFallingHearts.push(new FallingHeart(sourceHeart.cx, sourceHeart.cy, sourceHeart.color));
        }
    });

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 320, groundY);
        ctx.lineTo(width / 2 + 320, groundY);
        ctx.stroke();

        if (state === 'FALLING_DOT') {
            ctx.fillStyle = dotColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = dotColor;
            ctx.beginPath();
            ctx.arc(width / 2, dotY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            dotY += 7;
            if (dotY >= groundY) {
                state = 'GROWING_TRUNK';
            }
        }
        else if (state === 'GROWING_TRUNK') {
            if (trunkHeight < targetTrunkHeight) {
                trunkHeight += 4;
            } else {
                state = 'BRANCHING';
                const { p2 } = getTrunkCurvePoints();
                rootBranch = new Branch(p2.x, p2.y, 95, -Math.PI / 2, 14, 1);
            }

            drawTrunk(trunkHeight / targetTrunkHeight);
        }
        else if (state === 'BRANCHING') {
            drawTrunk(1);

            rootBranch.update();
            rootBranch.draw();

            if (rootBranch.progress >= 1 && rootBranch.children.length > 0 && !heartSpawned) {
                heartSpawned = true;
                let terminals = [];
                rootBranch.getTerminals(terminals);

                heartTargets.forEach(target => {
                    let src = terminals.length > 0 ? terminals[Math.floor(Math.random() * terminals.length)] : { x: rootBranch.x, y: rootBranch.y };
                    hearts.push(new TreeHeart(src.x, src.y, target.x, target.y));
                });
            }

            hearts.forEach(h => {
                h.update();
                h.draw();
            });

            interactiveFallingHearts.forEach((fh, index) => {
                fh.update();
                fh.draw();
                if (fh.y > height + 50) {
                    interactiveFallingHearts.splice(index, 1);
                }
            });
        }

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
