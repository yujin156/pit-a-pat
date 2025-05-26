document.querySelectorAll('.keyword').forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});