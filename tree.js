/* tree.js */
const chainToggle = document.getElementById('chainToggle');
const loginCard = document.getElementById('loginCard');
const body = document.body;

chainToggle.addEventListener('click', () => {
    // Add touch pull animation class
    chainToggle.classList.add('pull');
    
    setTimeout(() => {
        chainToggle.classList.remove('pull');
    }, 300);

    // Toggle lighting state and card visibility smoothly
    body.classList.toggle('active');
    loginCard.classList.toggle('active');
});
