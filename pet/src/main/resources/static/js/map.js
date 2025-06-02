const map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.5665, 126.9780),
    zoom: 11
});

let allTrailsVisible = false;
let currentPolylines = [];

function toggleAllTrails() {
    allTrailsVisible = !allTrailsVisible;

    const allTrailsSection = document.getElementById("allTrailsSection");
    const recommendList = document.getElementById("recommend-list");
    const loadRecommendBtn = document.getElementById("loadRecommendBtn");
    const dogIdSelect = document.getElementById("dogIdSelect");
    const loadingSpinner = document.getElementById("loadingSpinner");

    // 버튼 텍스트 바꾸기
    const toggleBtn = document.querySelector("button[onclick='toggleAllTrails()']");
    toggleBtn.textContent = allTrailsVisible ? "전체 둘레길 닫기" : "전체 둘레길 보기";

    if (allTrailsVisible) {
        allTrailsSection.style.display = 'block';
        // 추천 UI 숨김
        recommendList.style.display = 'none';
        loadRecommendBtn.style.display = 'none';
        dogIdSelect.style.display = 'none';
        loadingSpinner.style.display = 'none';
    } else {
        allTrailsSection.style.display = 'none';
        // 추천 UI 다시 보임
        recommendList.style.display = 'block';
        loadRecommendBtn.style.display = 'inline-block';
        dogIdSelect.style.display = 'inline-block';
    }

    if (allTrailsVisible) {
        loadTrailList();
    }
}



function drawTrailPath(trail) {
    currentPolylines.forEach(line => line.setMap(null));
    currentPolylines = [];

    fetch(`/api/trails/${trail.id}/path`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(path => {
            const coords = path.map(p => new naver.maps.LatLng(p.lat, p.lng));
            const poly = new naver.maps.Polyline({
                map,
                path: coords,
                strokeWeight: 4,
                strokeColor: '#3366FF',
                strokeOpacity: 0.8
            });
            currentPolylines.push(poly);

            const bounds = new naver.maps.LatLngBounds();
            coords.forEach(c => bounds.extend(c));
            map.fitBounds(bounds);
        })
        .catch(err => console.error('경로 실패:', err));
}


function openModalForTrail(trail) {
    document.getElementById("trailId").value = trail.id;
    document.getElementById("modalTrailName").textContent = trail.name + " 리뷰 작성";
    $('#postModal').show();
}

document.getElementById('loadRecommendBtn').addEventListener('click', () => {
    const dogId = $('#dogIdSelect').val();
    if (!dogId) {
        alert("강아지를 선택해주세요.");
        return;
    }

    $('#loadingSpinner').show();
    $('#recommend-list').empty();

    fetch(`/api/recommend/by-review?dogId=${dogId}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(trails => {
            const listEl = document.getElementById('recommend-list');
            listEl.innerHTML = '';

            trails.forEach(trail => {
                const li = document.createElement('li');
                li.textContent = `${trail.name} (${trail.lengthKm.toFixed(1)}km / ⭐${(trail.averageRating || 0).toFixed(1)})`;
                li.addEventListener('click', () => {
                    drawTrailPath(trail);
                    openModalForTrail(trail);
                });
                listEl.appendChild(li);
            });
        })
        .catch(err => {
            console.error('AI 추천 실패:', err);
            alert("추천 로딩 실패");
        })
        .finally(() => {
            $('#loadingSpinner').hide();
        });
});


function loadTrailList() {
    fetch('/api/trails')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(trails => {
            const listEl = document.getElementById('trail-list');
            listEl.innerHTML = '';

            trails.forEach(trail => {
                const li = document.createElement('li');

                new naver.maps.Marker({
                    map,
                    position: new naver.maps.LatLng(trail.startLat, trail.startLng),
                    icon: {
                        url: '/images/icons8-marker-a-32.png',
                        size: new naver.maps.Size(24, 24),
                        anchor: new naver.maps.Point(12, 12)
                    }
                });

                new naver.maps.Marker({
                    map,
                    position: new naver.maps.LatLng(trail.endLat, trail.endLng),
                    icon: {
                        url: '/images/end-marker.png',
                        size: new naver.maps.Size(24, 24),
                        anchor: new naver.maps.Point(12, 12)
                    }
                });
                li.textContent = `${trail.name} (${trail.lengthKm.toFixed(1)}km / ⭐${(trail.averageRating || 0).toFixed(1)})`;
                li.addEventListener('click', () => {
                    drawTrailPath(trail);
                    openModalForTrail(trail);
                });
                listEl.appendChild(li);
            });
        })
        .catch(err => console.error('전체 둘레길 실패:', err));
}

$('#dogIdSelect').on('change', function () {
    const dogId = $(this).val();
    loadAiRecommendations(dogId);
});

$('#postForm').on('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    $.ajax({
        url: '/trail-posts',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
            alert("등록 완료");
            $('#postModal').hide();
            $('#postForm')[0].reset();
            if (allTrailsVisible) loadTrailList();
            const dogId = $('#dogIdSelect').val();
            loadAiRecommendations(dogId);
        },
        error: function () {
            alert("등록 실패");
        }
    });
});

$(document).ready(function () {
    const dogId = $('#dogIdSelect').val();
    if (dogId) {
        loadAiRecommendations(dogId);
    }
});

function loadAiRecommendations(dogId) {
    $('#loadingSpinner').show();
    $('#recommend-list').empty();

    fetch(`/api/recommend/by-review?dogId=${dogId}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(trails => {
            const listEl = document.getElementById('recommend-list');
            listEl.innerHTML = '';

            trails.forEach(trail => {
                const li = document.createElement('li');
                li.textContent = `${trail.name} (${trail.lengthKm.toFixed(1)}km / ⭐${(trail.averageRating || 0).toFixed(1)})`;
                li.addEventListener('click', () => {
                    drawTrailPath(trail);
                    openModalForTrail(trail);
                });
                listEl.appendChild(li);
            });
        })
        .catch(err => {
            console.error('AI 추천 실패:', err);
            alert("추천 로딩 실패");
        })
        .finally(() => {
            $('#loadingSpinner').hide();
        });
}
