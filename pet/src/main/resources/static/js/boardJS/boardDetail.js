function showEdit(bcno) {
    const form = document.getElementById('edit-form-' + bcno);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function toggleLike(bno) {
    fetch(`/board/${bno}/like`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            alert('좋아요 처리됨!');
            location.reload();
        });
}

function toggleBookmark(bno) {
    fetch(`/board/${bno}/bookmark`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            alert('북마크 처리됨!');
            location.reload();
        });
}