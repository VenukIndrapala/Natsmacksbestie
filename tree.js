/* tree.js */
const chainToggle = document.getElementById('chainToggle');
const loginCard = document.getElementById('loginCard');
const body = document.body;
const lampScene = document.getElementById('lampScene');
const mainScene = document.getElementById('mainScene');
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

// Password submission and transition to the authentic tree animation scene
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
        lampScene.classList.add('hidden');
        body.classList.remove('active');
        body.style.backgroundColor = "#ffe4e1";
        mainScene.classList.add('active');

        // Play audio as implemented in the reference code snippet
        if (audioElement) {
            audioElement.play().catch(err => console.log("Audio autoplay restricted:", err));
        }

        // Trigger the external tree and heart JS animation framework if loaded
        if (typeof startTreeAnimation === 'function') {
            startTreeAnimation();
        }
    } else {
        alert("Incorrect password! Try again.");
        passwordInput.value = "";
    }
});
