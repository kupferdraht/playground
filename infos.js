// filepath: /home/marchouh/Schreibtisch/Ismail/playground.io/script.js
const menuToggle = document.querySelector('.menu-toggle');
const navUl = document.querySelector('nav ul');
menuToggle.addEventListener('click', () => {
    navUl.classList.toggle('open');
});
navUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navUl.classList.remove('open');
    });
});