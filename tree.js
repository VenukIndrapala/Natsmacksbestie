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
        startLoveTypewriter();
    }, 400);
});

// --- Final Tree & Heart Animation Logic ---
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
    let groundY = height - 100;
    const trunkColor = "#864B24"; 

    const treeScale = 0.95; 
    const trunkElongation = 45;

    // --- Tree offset locked to 0 to prevent moving to the right ---
    let treeOffsetX = 0;
    let movingStarted = false;
    let fallingHearts = [];

    class CubicBranch {
        constructor(sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, w0, w1, delay) {
            let sy_adj = sy === 0 ? 0 : sy - trunkElongation;
            let cp1y_adj = sy === 0 ? cp1y - (trunkElongation/2) : cp1y - trunkElongation;
            let cp2y_adj = cp2y - trunkElongation;
            let ey_adj = ey - trunkElongation;

            this.p0 = { x: sx * treeScale, y: sy_adj * treeScale };
            this.p1 = { x: cp1x * treeScale, y: cp1y_adj * treeScale };
            this.p2 = { x: cp2x * treeScale, y: cp2y_adj * treeScale };
            this.p3 = { x: ex * treeScale, y: ey_adj * treeScale };
            this.w0 = w0 * treeScale;
            this.w1 = w1 * treeScale;
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

    const heartColors = [
        '#FFDA03', // Sunflower Yellow
        '#FF6800', // Fiery Tangerine
        '#FCAE1E', // Marigold
        '#FF7F50', // Coral
        '#F88379', // Coral-Pink
        '#FFFDD0', // Cream
        '#FADADD'  // Blush
    ];

    class HeartParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 4.5; 
            this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
            this.angle = (Math.random() - 0.5) * 0.4; 
            this.flutterSpeed = Math.random() * 0.03 + 0.015;
            this.flutterOffset = Math.random() * Math.PI * 2;
            this.scale = 0; 
            this.targetScale = Math.random() * 0.4 + 0.8; 
        }

        update() {
            if (this.scale < this.targetScale) {
                this.scale += 0.06; 
            }
        }

        draw(ctx, offsetX) {
            offsetX = offsetX || 0;
            ctx.save();
            ctx.translate(this.x + offsetX, this.y);
            
            let currentScale = this.scale;
            if (this.scale >= this.targetScale) {
                currentScale += Math.sin(Date.now() * this.flutterSpeed + this.flutterOffset) * 0.08;
            }
            
            ctx.scale(currentScale, currentScale);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            
            ctx.beginPath();
            let top = -this.size * 0.3;
            ctx.moveTo(0, top);
            ctx.bezierCurveTo(-this.size, -this.size, -this.size * 1.5, this.size / 3, 0, this.size);
            ctx.bezierCurveTo(this.size * 1.5, this.size / 3, this.size, -this.size, 0, top);
            ctx.fill();
            
            ctx.restore();
        }
    }

    class FallingHeart {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4.5 + 4;
            this.color = color;
            this.vx = -(Math.random() * 1.1 + 0.3);
            this.vy = Math.random() * 0.6 + 0.4;
            this.gravity = 0.045;
            this.angle = Math.random() * Math.PI * 2;
            this.vRot = (Math.random() - 0.5) * 0.05;
            this.flutterSpeed = Math.random() * 0.05 + 0.02;
            this.flutterOffset = Math.random() * Math.PI * 2;
            this.life = 1;
        }

        update() {
            this.vy += this.gravity;
            this.x += this.vx + Math.sin(Date.now() * this.flutterSpeed + this.flutterOffset) * 0.6;
            this.y += this.vy;
            this.angle += this.vRot;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;

            ctx.beginPath();
            let top = -this.size * 0.3;
            ctx.moveTo(0, top);
            ctx.bezierCurveTo(-this.size, -this.size, -this.size * 1.5, this.size / 3, 0, this.size);
            ctx.bezierCurveTo(this.size * 1.5, this.size / 3, this.size, -this.size, 0, top);
            ctx.fill();

            ctx.restore();
        }
    }

    function getHeartPoint(centerX, centerY, radius) {
        while (true) {
            let nx = (Math.random() * 2.4) - 1.2;
            let ny = (Math.random() * 2.4) - 1.2;
            
            let val = Math.pow(nx*nx + ny*ny - 1, 3) - (nx*nx * Math.pow(ny, 3));
            if (val <= 0) {
                return { 
                    x: centerX + nx * radius, 
                    y: centerY - ny * radius 
                };
            }
        }
    }

    let branches = [];
    let hearts = [];
    const MAX_HEARTS = 900;

    function setupBranches() {
        branches.push(new CubicBranch(0, 0, 0, -60, -2, -120, -3, -175, 24, 10, 0));
        branches.push(new CubicBranch(-2, -88, -35, -114, -75, -145, -100, -188, 6, 0.1, 12));
        branches.push(new CubicBranch(-1.7, -117, 18, -136, 48, -128, 70, -150, 3.4, 0.1, 40));
        branches.push(new CubicBranch(-3, -175, -30, -206, -55, -246, -63, -276, 7, 2.4, 55));
        branches.push(new CubicBranch(-63, -276, -76, -288, -85, -298, -92, -306, 2.4, 0.1, 78));
        branches.push(new CubicBranch(-63, -276, -66, -290, -68, -302, -70, -313, 2.4, 0.1, 78));
        branches.push(new CubicBranch(-3, -175, 24, -197, 41, -217, 47, -234, 7, 2.4, 55));
        branches.push(new CubicBranch(47, -234, 59, -246, 68, -257, 75, -266, 2.4, 0.1, 78));
        branches.push(new CubicBranch(47, -234, 51, -248, 54, -260, 56, -271, 2.4, 0.1, 78));
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
        else if (state === 'GROWING_TREE' || state === 'SPAWNING_HEARTS') {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, width, groundY - 1); 
            ctx.clip();

            let allGrown = true;
            branches.forEach(branch => {
                branch.update();
                branch.draw(ctx, targetGroundX + treeOffsetX, groundY);
                if (branch.progress < 1) allGrown = false;
            });

            ctx.restore();

            if (allGrown && state === 'GROWING_TREE') {
                state = 'SPAWNING_HEARTS';
            }

            if (state === 'SPAWNING_HEARTS') {
                if (hearts.length < MAX_HEARTS) {
                    for (let i = 0; i < 8; i++) {
                        if (hearts.length < MAX_HEARTS) {
                            let canopyCenterY = groundY - (250 * treeScale);
                            let heartRadius = 150 * treeScale;
                            
                            let pt = getHeartPoint(targetGroundX, canopyCenterY, heartRadius);
                            hearts.push(new HeartParticle(pt.x, pt.y));
                        }
                    }
                } else {
                    movingStarted = true;
                }

                hearts.forEach(h => {
                    h.update();
                    h.draw(ctx, treeOffsetX);
                });

                if (movingStarted) {
                    // treeOffsetX is kept at 0 so movement doesn't occur, 
                    // but falling hearts from the canopy continue smoothly.
                    if (hearts.length > 0 && Math.random() < 0.6) {
                        let source = hearts[Math.floor(Math.random() * hearts.length)];
                        fallingHearts.push(new FallingHeart(source.x + treeOffsetX, source.y, source.color));
                    }

                    for (let i = fallingHearts.length - 1; i >= 0; i--) {
                        let fh = fallingHearts[i];
                        fh.update();
                        fh.draw(ctx);
                        if (fh.y > groundY + 30 || fh.x < -30) {
                            fallingHearts.splice(i, 1);
                        }
                    }
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}

const loveMessageFull = `Hey Nati, 
So this was meant for bestie clearly, but I just felt like I should annoy her now even though I’ll probably be sending this at 2am in the morning and she’s definitely going to be rebooting when she reads this, she’s going to see the tree and go “meh mokada meh pissu” XD. But just wanted to come here and say that you’ve had quite the hectic week and you haven’t been feeling that great and honestly you are genuinely doing an amazing job hanging in there that strong with everything that’s going on and I couldn’t be more proud of you, you can give some of that to the rest of the world don’t gate keep thanks ._. And now bestie is supposed to come today but I think even bestie is depressed and even she doesn’t want to say hello. And even if she does I know you’ll be knocking her out in seconds cause you are just strong independent and really cool like that VERY SLAY GURL. I’m sure she’s reading this like “ugh there’s more to this paragraph” so guess what I’m going to do, I’m going to keep dragging this sentence out like this where I’m just typing the word 'typing' for the funsies of typing so you’ll have to read all of this and there’s literally no point in reading this cause this is just pure rage baiting :p. but if you made it this far and ur still here, I miss you ma’am and by miss I mean properly hanging out with you without having to be cautious and all stressed. I really miss being able to atleast hold your hand or give a big hug which i hope i get to give today, but hopefully with locking in and praying triples and quadruples things will be better and I can finally have my missing rib guys thanks :) so yeah stay strong stay happy and always keep that beautiful smile of yours with you don’t ever loose it okay and like always if there’s anything you want to talk about I am here to talk and make it worse :D (if you made it this far early in the morning I’m genuinely impressed and I’ll see you at yf Ma’am, I’m going to do a hand sign when I see you today just know that’s me saying you look really beautiful today cause I can’t say it out loud so yeah see you then)`;

function startLoveTypewriter() {
    const box = document.getElementById('loveTextBox');
    if (!box) return;

    box.style.fontStyle = 'italic'; 

    let charIndex = 0;
    let pageText = '';
    const typingSpeed = 26;
    const pageBreakPause = 1900; 

    function typeNext() {
        if (charIndex >= loveMessageFull.length) return;

        const nextChar = loveMessageFull[charIndex];
        pageText += nextChar;
        box.textContent = pageText;

        if (box.scrollHeight > box.clientHeight) {
            pageText = pageText.slice(0, -1);
            box.textContent = pageText;

            setTimeout(() => {
                pageText = '';
                box.textContent = '';
                setTimeout(typeNext, typingSpeed);
            }, pageBreakPause);
            return;
        }

        charIndex++;
        setTimeout(typeNext, typingSpeed);
    }

    typeNext();
}
