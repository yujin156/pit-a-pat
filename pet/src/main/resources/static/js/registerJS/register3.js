document.getElementById('dogImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.querySelector('.image-preview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Dog Image" />`;
    };
    reader.readAsDataURL(file);
});