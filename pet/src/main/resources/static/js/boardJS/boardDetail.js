// dno 값을 가져오는 함수
function getLoginDogDno() {
    const dnoInput = document.getElementById('loginDogDno');
    return dnoInput ? dnoInput.value : null; // loginDog가 없으면 null 반환
}

function showEdit(bcno) {
    const form = document.getElementById('edit-form-' + bcno);
    const contentSpan = document.getElementById('comment-content-' + bcno);
    if (form.style.display === 'none') {
        form.style.display = 'block';
        contentSpan.style.display = 'none';
    } else {
        form.style.display = 'none';
        contentSpan.style.display = 'block';
    }
}

function toggleLike() {
    const bno = document.getElementById("boardBno").value;
    const dno = getLoginDogDno();
    if (!dno) {
        alert('로그인한 강아지 정보가 없습니다.');
        return;
    }

    fetch(`/board/${bno}/like?dno=${dno}`, { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message); });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            document.getElementById('likeCount').textContent = data.likeCount;
            const likeBtn = document.querySelector('.board-actions button:nth-of-type(1)');
            likeBtn.textContent = data.isLiked ? '❤️ 좋아요 취소' : '🤍 좋아요';
            likeBtn.style.color = data.isLiked ? 'red' : 'black';
        })
        .catch(err => alert('좋아요 에러: ' + err.message));
}

function toggleBookmark() {
    const bno = document.getElementById("boardBno")?.value;
    const dno = getLoginDogDno();

    if (!bno) {
        alert("bno를 찾을 수 없습니다.");
        return;
    }
    if (!dno) {
        alert("dno를 찾을 수 없습니다.");
        return;
    }

    fetch(`/board/${bno}/bookmark?dno=${dno}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || '북마크 오류 발생');
                });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            const bookmarkButton = document.querySelector('.board-actions button:nth-of-type(2)');
            bookmarkButton.textContent = data.isBookmarked ? '📌 북마크 취소' : '📍 북마크';
            bookmarkButton.style.color = data.isBookmarked ? 'blue' : 'black';
        })
        .catch(error => {
            console.error('북마크 토글 중 에러:', error);
            alert('북마크 처리 중 오류가 발생했습니다: ' + error.message);
        });
}