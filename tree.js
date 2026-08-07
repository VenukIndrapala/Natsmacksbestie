/* tree.js */
const chainToggle = document.getElementById('chainToggle');
const loginCard = document.getElementById('loginCard');
const body = document.body;
const lampScene = document.getElementById('lampScene');
const heartScene = document.getElementById('heartScene');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');

// Set your desired password here
const CORRECT_PASSWORD = "123";

// Lamp pull chain interaction
chainToggle.addEventListener('click', () => {
    chainToggle.classList.add('pull');
    setTimeout(() => {
        chainToggle.classList.remove('pull');
    }, 300);

    body.classList.toggle('active');
    loginCard.classList.toggle('active');
});

// Password submission and scene transition
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
        lampScene.classList.add('hidden');
        body.classList.remove('active');
        body.style.backgroundColor = "#000";
        heartScene.classList.add('active');
        startHeartAnimation();
    } else {
        alert("Incorrect password! Try again.");
        passwordInput.value = "";
    }
});

// Heart Particle Animation Engine
function startHeartAnimation() {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Heart coordinate math function
    function getHeartPoint(t) {
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        return { x: x, y: y };
    }

    const tau = Math.PI * 2;
    let points = [];
    
    // Generate base heart outline points
    for (let i = 0; i < 300; i++) {
        let t = (i / 300) * tau;
        let p = getHeartPoint(t);
        points.push({
            x: p.x * 15 + width / 2,
            y: p.y * 15 + height / 2 - 30
        });
    }

    let particles = [];
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 1;
            this.color = `hsl(${Math.random() * 60 + 330}, 100%, ${Math.random() * 40 + 50}%)`;
            this.angle = Math.random() * tau;
            this.speed = Math.random() * 2 + 0.5;
            this.life = Math.random() * 100 + 50;
        }
        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.life--;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, tau);
            ctx.fill();
        }
    }

    // Animation Loop
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);

        // Draw steady heart shape
        points.forEach(pt => {
            ctx.fillStyle = '#ff3366';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, tau);
            ctx.fill();
        });

        // Spawn ambient particles around heart
        if (points.length > 0) {
            let randPt = points[Math.floor(Math.random() * points.length)];
            particles.push(new Particle(randPt.x + (Math.random() - 0.5) * 20, randPt.y + (Math.random() - 0.5) * 20));
        }

        particles.forEach((p, index) => {
            p.update();
            p.draw();
            if (p.life <= 0) {
                particles.splice(index, 1);
            }
        });

        requestAnimationFrame(animate);
    }
    animate();

    // Typewriter text effect matching the reference video sequence
    const textContainer = document.getElementById('textContainer');
    const textLines = [
        "Hey, you <br> Happy Birthday :)",
        "May God bless you <br> And give you many happiness :)",
        "Wishing you a day filled with love and laughter...",
        "Always keep smiling <br> Cheers! ✨"
    ];

    let lineIndex = 0;
    function showNextLine() {
        if (lineIndex < textLines.length) {
            textContainer.style.opacity = 0;
            setTimeout(() => {
                textContainer.innerHTML = textLines[lineIndex];
                textContainer.style.opacity = 1;
                lineIndex++;
                setTimeout(showNextLine, 4000);
            }, 500);
        }
    }
    setTimeout(showNextLine, 1000);
}
