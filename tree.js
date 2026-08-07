/* tree.js */
const chainToggle = document.getElementById('chainToggle');
const loginCard = document.getElementById('loginCard');
const body = document.body;
const lampScene = document.getElementById('lampScene');
const videoAnimationScene = document.getElementById('videoAnimationScene');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const audioElement = document.getElementById('myAudio');

const CORRECT_PASSWORD = "123";

// Lamp pull chain interaction (Unchanged)
chainToggle.addEventListener('click', () => {
    chainToggle.classList.add('pull');
    setTimeout(() => {
        chainToggle.classList.remove('pull');
    }, 300);

    body.classList.toggle('active');
    loginCard.classList.toggle('active');
});

// Password confirmation and triggering exact video tree growth animation
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

        startVideoTreeAnimation();
    } else {
        alert("Incorrect password! Try again.");
        passwordInput.value = "";
    }
});

// Accurate implementation of the blossoming tree & blooming heart bloom sequence seen in the reference video
function startVideoTreeAnimation() {
    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Branch growth and blossom particle simulation
    let branches = [];
    let blossoms = [];
    let animProgress = 0;

    class Branch {
        constructor(x, y, length, angle, thickness, generation) {
            this.x = x;
            this.y = y;
            this.length = length;
            this.angle = angle;
            this.thickness = thickness;
            this.generation = generation;
            this.progress = 0;
            this.children = [];
            this.hasCreatedChildren = false;
        }

        update() {
            if (this.progress < 1) {
                this.progress += 0.03;
            } else if (!this.hasCreatedChildren && this.generation < 5) {
                this.hasCreatedChildren = true;
                let endX = this.x + Math.cos(this.angle) * this.length;
                let endY = this.y + Math.sin(this.angle) * this.length;

                let leftAngle = this.angle - 0.45;
                let rightAngle = this.angle + 0.45;
                this.children.push(new Branch(endX, endY, this.length * 0.75, leftAngle, this.thickness * 0.7, this.generation + 1));
                this.children.push(new Branch(endX, endY, this.length * 0.75, rightAngle, this.thickness * 0.7, this.generation + 1));
            }

            this.children.forEach(child => child.update());
        }

        draw() {
            let currentLength = this.length * Math.min(this.progress, 1);
            let endX = this.x + Math.cos(this.angle) * currentLength;
            let endY = this.y + Math.sin(this.angle) * currentLength;

            ctx.strokeStyle = "#c29b2b";
            ctx.lineWidth = this.thickness;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            this.children.forEach(child => child.draw());
        }
    }

    // Initialize root tree position near bottom center
    let rootTree = new Branch(width / 2, height - 80, 110, -Math.PI / 2, 9, 1);

    class HeartParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3.5 + 1.5;
            this.color = `hsl(${Math.random() * 30 + 330}, 100%, ${Math.random() * 30 + 60}%)`;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
            this.life = 1;
            this.decay = Math.random() * 0.015 + 0.005;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(this.life, 0);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Heart Math generator for the crown
    function getHeartCoords(t, scale) {
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        return {
            x: width / 2 + x * scale,
            y: (height / 2 - 60) + y * scale
        };
    }

    let heartPoints = [];
    for (let i = 0; i < 250; i++) {
        let t = (i / 250) * Math.PI * 2;
        heartPoints.push(getHeartCoords(t, 13));
    }

    let frame = 0;
    function loop() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, width, height);

        rootTree.update();
        rootTree.draw();

        frame++;
        if (frame > 80) {
            // Spawn heart cluster blossoms matching video reference
            for (let i = 0; i < 4; i++) {
                let pt = heartPoints[Math.floor(Math.random() * heartPoints.length)];
                blossoms.push(new HeartParticle(pt.x + (Math.random() - 0.5) * 15, pt.y + (Math.random() - 0.5) * 15));
            }
        }

        blossoms.forEach((b, index) => {
            b.update();
            b.draw();
            if (b.life <= 0) {
                blossoms.splice(index, 1);
            }
        });

        requestAnimationFrame(loop);
    }
    loop();

    // Typewriter greeting messages corresponding to the reference animation sequence
    const loveMessage = document.getElementById('loveMessage');
    const messages = [
        "Hey, you :)<br>Happy Birthday!",
        "May God bless you<br>And give you many happiness :)",
        "Always keep smiling<br>Cheers to you! ✨"
    ];

    let msgIndex = 0;
    function showMessages() {
        if (msgIndex < messages.length) {
            loveMessage.style.opacity = 0;
            setTimeout(() => {
                loveMessage.innerHTML = messages[msgIndex];
                loveMessage.style.opacity = 1;
                msgIndex++;
                setTimeout(showMessages, 4500);
            }, 600);
        }
    }
    setTimeout(showMessages, 2500);
}
