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

        startFullyFilledTreeAnimation();
    } else {
        alert("Incorrect password! Try again.");
        passwordInput.value = "";
    }
});

// Fully filled blooming tree and dense heart blossom animation matching the reference video
function startFullyFilledTreeAnimation() {
    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let branches = [];
    let blossoms = [];

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
                this.progress += 0.035;
            } else if (!this.hasCreatedChildren && this.generation < 6) {
                this.hasCreatedChildren = true;
                let endX = this.x + Math.cos(this.angle) * this.length;
                let endY = this.y + Math.sin(this.angle) * this.length;

                let leftAngle = this.angle - 0.42;
                let rightAngle = this.angle + 0.42;
                this.children.push(new Branch(endX, endY, this.length * 0.78, leftAngle, this.thickness * 0.7, this.generation + 1));
                this.children.push(new Branch(endX, endY, this.length * 0.78, rightAngle, this.thickness * 0.7, this.generation + 1));
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

        getTerminalPoints(list) {
            let endX = this.x + Math.cos(this.angle) * this.length;
            let endY = this.y + Math.sin(this.angle) * this.length;
            if (this.children.length === 0) {
                list.push({ x: endX, y: endY });
            } else {
                this.children.forEach(child => child.getTerminalPoints(list));
            }
        }
    }

    let rootTree = new Branch(width / 2, height - 80, 115, -Math.PI / 2, 9, 1);

    class BlossomParticle {
        constructor(x, y, targetX, targetY) {
            this.x = x;
            this.y = y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.currentX = x;
            this.currentY = y;
            this.progress = 0;
            this.speed = Math.random() * 0.04 + 0.02;
            this.size = Math.random() * 2.5 + 1.2;
            this.color = `hsl(${Math.random() * 25 + 335}, 100%, ${Math.random() * 35 + 55}%)`;
        }

        update() {
            if (this.progress < 1) {
                this.progress += this.speed;
                this.currentX = this.currentX + (this.targetX - this.currentX) * 0.1;
                this.currentY = this.currentY + (this.targetY - this.currentY) * 0.1;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.currentX, this.currentY, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Generate heavy heart contour coordinate targets
    let heartTargets = [];
    for (let i = 0; i < 700; i++) {
        let t = (i / 700) * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        // Fill both outline and interior volume of the heart to make it dense and fully filled
        let internalFactor = Math.random();
        heartTargets.push({
            x: width / 2 + x * 14 * Math.sqrt(internalFactor),
            y: (height / 2 - 65) + y * 14 * Math.sqrt(internalFactor)
        });
    }

    let frame = 0;
    let blossomsSpawned = false;

    function loop() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, height);

        rootTree.update();
        rootTree.draw();

        frame++;
        if (frame > 90 && !blossomsSpawned) {
            blossomsSpawned = true;
            let terminals = [];
            rootTree.getTerminalPoints(terminals);

            // Emit dense flowers from branch tips to fill the entire heart shape fully
            heartTargets.forEach(target => {
                let source = terminals.length > 0 ? terminals[Math.floor(Math.random() * terminals.length)] : { x: width / 2, y: height / 2 };
                blossoms.push(new BlossomParticle(source.x, source.y, target.x, target.y));
            });
        }

        blossoms.forEach(b => {
            b.update();
            b.draw();
        });

        requestAnimationFrame(loop);
    }
    loop();

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
