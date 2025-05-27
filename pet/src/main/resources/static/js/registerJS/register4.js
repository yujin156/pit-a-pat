// document.querySelectorAll('.keyword').forEach(item => {
//     item.addEventListener('click', () => {
//         item.classList.toggle('active');
//     });
// });

document.querySelectorAll('.keyword').forEach(item => {
    item.addEventListener('click', () => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        item.classList.toggle('active');
    });
});