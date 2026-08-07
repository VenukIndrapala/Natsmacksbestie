/* tree.js */
const chainToggle = document.getElementById('chainToggle');
const loginCard = document.getElementById('loginCard');
const body = document.body;
const lampScene = document.getElementById('lampScene');
const mainScene = document.getElementById('main');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const audioElement = document.getElementById('myAudio');

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

// Password submission, hiding the lamp view, and initializing the original tree animation framework
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
        lampScene.classList.add('hidden');
        body.classList.remove('active');
        body.style.backgroundColor = "#ffe4e1";
        mainScene.style.display = "block";

        // Play audio element
        if (audioElement) {
            audioElement.play().catch(err => console.log("Audio autoplay restricted:", err));
        }

        // Execute the original Jscex and love.js animation logic once loaded
        if (typeof startLoveAnimation === 'function') {
            startLoveAnimation();
        } else if (window.eval && typeof eval === 'function') {
            // Fallback trigger if love.js uses standard document ready auto-execution structure
            $(document).ready(function() {
                if (typeof $().code === 'function' || window.tree) {
                    // Framework handles itself on DOM ready, ensuring visibility triggers execution
                }
            });
        }
    } else {
        alert("Incorrect password! Try again.");
        passwordInput.value = "";
    }
});
