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

    let state = 'FALLING_HEART'; // Matches video starting with the heart falling down
    let dotY = height / 2 - 180;
    let groundY = height - 140;
    
    let trunkHeight = 0;
    let targetTrunkHeight = 130;
    let trunkWidth = 14;

    let rootBranch = null;
    let hearts = [];
    let heartSpawned = false;
    let interactiveFallingHearts = [];

    const treeColor = "#ffb6c1";

    // Precise geometric heart shape matching the video style
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
        }

        update() {
            if (this.progress < 1) {
                this.progress += 0.04;
            } else if (!this.hasChild && this.gen < 5) {
                this.hasChild = true;
                let endX = this.x + Math.cos(this.angle) * this.length;
                let endY = this.y + Math.sin(this.angle) * this.length;
                this.children.push(new Branch(endX, endY, this.length * 0.75, this.angle - 0.4, this.thickness * 0.7, this.gen + 1));
                this.children.push(new Branch(endX, endY, this.length * 0.75, this.angle + 0.4, this.thickness * 0.7, this.gen + 1));
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
            this.speed = Math.random() * 0.035 + 0.025;
            this.size = Math.random() * 4 + 7;
            
            const hues = [340, 350, 15, 30, 45, 320];
            this.color = `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 100%, 70%)`;
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
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        let fillFactor = Math.random();
        heartTargets.push({
            x: width / 2 + x * 11 * Math.sqrt(fillFactor),
            y: (groundY - targetTrunkHeight - 110) + y * 11 * Math.sqrt(fillFactor)
        });
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = 0; i < 15; i++) {
            let sourceHeart = hearts.length > 0 ? hearts[Math.floor(Math.random() * hearts.length)] : {cx: clickX, cy: clickY, color: '#ffb6c1'};
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
            // Render the falling heart matching the reference video beginning
            drawHeartShape(width / 2, dotY, 12, "#ffb6c1");
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffb6c1";
            drawHeartShape(width / 2, dotY, 12, "#ffb6c1");
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
                rootBranch = new Branch(width / 2, groundY - targetTrunkHeight, 95, -Math.PI / 2, trunkWidth, 1);
            }

            ctx.strokeStyle = treeColor;
            ctx.lineWidth = trunkWidth;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(width / 2, groundY);
            ctx.lineTo(width / 2, groundY - trunkHeight);
            ctx.stroke();
        } 
        else if (state === 'BRANCHING') {
            ctx.strokeStyle = treeColor;
            ctx.lineWidth = trunkWidth;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(width / 2, groundY);
            ctx.lineTo(width / 2, groundY - targetTrunkHeight);
            ctx.stroke();

            rootBranch.update();
            rootBranch.draw();

            if (rootBranch.progress >= 1 && rootBranch.children.length > 0 && !heartSpawned) {
                heartSpawned = true;
                let terminals = [];
                rootBranch.getTerminals(terminals);

                heartTargets.forEach(target => {
                    let src = terminals.length > 0 ? terminals[Math.floor(Math.random() * terminals.length)] : { x: width / 2, y: groundY - targetTrunkHeight };
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
