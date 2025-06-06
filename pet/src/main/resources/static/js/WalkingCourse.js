const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 3
};
const map = new kakao.maps.Map(mapContainer, mapOption);

let allTrailsVisible = false;
let currentPolylines = [];
let walkingData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 4;


const difficultyColors = {
    "쉬움": "walking_green_label",
    "보통": "walking_yellow_label",
    "어려움": "walking_red_label",
    "정보 없음": "walking_gray_label"
};

const dogTypeColors = {
    "소형견": "walking_green_label",
    "중형견": "walking_yellow_label",
    "대형견": "walking_red_label"
};
const difficultyTextMap = {
    "EASY": "쉬움",
    "MEDIUM": "보통",
    "HARD": "어려움"
};

function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';

    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star">⭐</span>';
    }
    if (hasHalfStar) {
        starsHTML += '<span class="star">⭐️</span>';
    }
    return starsHTML;
}
function createWalkingItem(data) {
    const dogs = data.recommendedDogs || [];
    let difficultyText = '정보 없음';
    if (data.difficulty) {
        const upper = data.difficulty.toUpperCase();
        if (difficultyTextMap[upper]) {
            difficultyText = difficultyTextMap[upper];
        } else if (Object.values(difficultyTextMap).includes(data.difficulty)) {
            difficultyText = data.difficulty;
        }
    }

    const addressHTML = data.address ? `<p class="map_address">${data.address}</p>` : `<p class="map_address" data-lat="${data.startLat}" data-lng="${data.startLng}">주소 변환 중...</p>`;

    return `
        <div class="walking_item" data-course='${JSON.stringify(data)}'>
            <button class="review_button" type="button">후기 작성</button>
            <div class="walking_title_box">
                <h2 class="walking_title">${data.title}</h2>
                <p class="walking_sub_title">${data.subtitle}</p>
            </div>

            <div class="walking_address">
                ${addressHTML}
                <div class="star_review">
                    <div class="star_review_icon">
                        ${createStarRating(data.rating)}
                    </div>
                </div>
            </div>

            <div class="walking_level_box">
                <div class="walking_level_row">
                    <div class="walking_level_set">
                        <p class="level_course">난이도</p>
                        <span class="${difficultyColors[difficultyText]}">${difficultyText}</span>
                    </div>
                    <div class="walking_level_set">
                        <p class="recommend_dogType">추천 견종</p>
                        ${dogs.map(dog => `<span class="${dogTypeColors[dog]}">${dog}</span>`).join('')}
                    </div>
                </div>
                <div class="walking_level_row">
                    <div class="walking_level_set">
                        <p class="total_road">${data.distance}</p>
                    </div>
                    <div class="walking_level_set">
                        <span class="start_point">${data.startPoint}</span>
                        <span class="end_point">${data.endPoint}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function toggleAllTrails() {
    allTrailsVisible = !allTrailsVisible;

    const allTrailsSection = document.getElementById("allTrailsSection");
    const recommendList = document.getElementById("recommend-list");
    const loadRecommendBtn = document.getElementById("loadRecommendBtn");
    const dogIdSelect = document.getElementById("dogIdSelect");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const toggleBtn = document.querySelector("button[onclick='toggleAllTrails()']");
    toggleBtn.textContent = allTrailsVisible ? "추천 보기" : "전체 둘레길 보기";

    if (allTrailsVisible) {
        recommendList.style.display = 'none';
        loadRecommendBtn.style.display = 'none';
        dogIdSelect.style.display = 'none';
        loadingSpinner.style.display = 'none';
        loadTrailListFromServer();
    } else {
        recommendList.style.display = 'block';
        loadRecommendBtn.style.display = 'inline-block';
        dogIdSelect.style.display = 'inline-block';
        const dogId = $('#dogIdSelect').val();
        if (dogId) loadAiRecommendations(dogId);
    }
}
function drawTrailPath(trail) {
    currentPolylines.forEach(line => line.setMap(null));
    currentPolylines = [];

    fetch(`/api/trails/${trail.id}/path`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(path => {
            const coords = path.map(p => new kakao.maps.LatLng(p.lat, p.lng));
            const polyline = new kakao.maps.Polyline({
                map: map,
                path: coords,
                strokeWeight: 4,
                strokeColor: '#3366FF',
                strokeOpacity: 0.8
            });
            currentPolylines.push(polyline);

            const bounds = new kakao.maps.LatLngBounds();
            coords.forEach(c => bounds.extend(c));
            map.setBounds(bounds);
        })
        .catch(err => console.error('경로 실패:', err));
}

function openModalForTrail(trail) {
    const parsedTrail = typeof trail === 'string' ? JSON.parse(trail) : trail;
    document.getElementById("trailId").value = parsedTrail.id;
    document.getElementById("modalTrailName").textContent = parsedTrail.title + " 리뷰 작성";
    $('#modalDogSelect').val($('#dogIdSelect').val());
    $('#postModal').show();
}

function loadTrailListFromServer() {
    fetch('/api/trails')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
            walkingData = mapTrailData(data, "전체 코스");
            filteredData = [...walkingData];
            renderWalkingList(true);

            // 지도에 마커 표시
            data.forEach(trail => {
                new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(trail.startLat, trail.startLng)
                });
                new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(trail.endLat, trail.endLng)
                });
            });
        })
        .catch(err => console.error('트레일 불러오기 실패:', err));
}

//
// function loadAiRecommendations(dogId) {
//     $('#loadingSpinner').show();
//     fetch(`/api/recommend/by-review?dogId=${dogId}`)
//         .then(r => r.ok ? r.json() : Promise.reject(r.status))
//         .then(data => {
//             filteredData = mapTrailData(data, "AI 추천 코스");
//             currentPage = 1;
//             renderWalkingList(false);
//         })
//         .catch(err => {
//             console.error('AI 추천 실패:', err);
//             alert("추천 로딩 실패");
//         })
//         .finally(() => {
//             $('#loadingSpinner').hide();
//         });
// }


$(document).on('click', '.review_button', function (e) {
    e.stopPropagation();
    const walkingItem = $(this).closest('.walking_item');
    const courseData = JSON.parse(walkingItem.attr('data-course'));
    openModalForTrail(courseData);
});

function convertAllMissingAddresses() {

    $('.map_address[data-lat][data-lng]').each(function(index) {
        const $el = $(this);
        const lat = parseFloat($el.data('lat'));
        const lng = parseFloat($el.data('lng'));


        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`[WARN] ${index}번 요소의 위경도가 잘못되었습니다.`);
            $el.text("유효하지 않은 좌표");
            return;
        }

        reverseGeocode(lat, lng, (address) => {
            if (address) {

                $el.text(address);
            } else {
                console.warn(`[FAIL] 주소 변환 실패: ${lat}, ${lng}`);
                $el.text("주소 변환 실패");
            }
        });
    });
}


function renderWalkingList(append = false) {
    const walkingList = document.getElementById('walkingItemList');

    if (!append) {
        walkingList.innerHTML = '';
        currentPage = 1;
    }

    const endIndex = currentPage * itemsPerPage;
    const items = filteredData.slice(0, endIndex);

    const html = items.map((item, i) => {
        const itemHTML = createWalkingItem(item);
        return itemHTML.replace('<div class="walking_item"', `<div class="walking_item" style="animation-delay: ${i * 0.1}s"`);
    }).join('');

    walkingList.insertAdjacentHTML('beforeend', html);
    updateLoadMoreButton();

    filteredData.forEach((trail, idx) => {
        const el = walkingList.children[idx];
        if (el) {
            el.addEventListener('click', () => {
                drawTrailPath(trail);
            });
        }
    });

    // ⭐⭐⭐ 반드시 마지막에 호출!
    convertAllMissingAddresses();
}


function updateLoadMoreButton() {
    const btn = document.getElementById('loadMoreBtn');
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (currentPage >= totalPages) {
        btn.disabled = true;
        btn.textContent = '모든 코스를 확인했습니다';
    } else {
        btn.disabled = false;
        const remain = filteredData.length - currentPage * itemsPerPage;
        btn.textContent = `더보기 (${remain}개 더)`;
    }
}
//
// $(document).ready(() => {
//     const dogId = $('#dogIdSelect').val();
//     if (dogId) loadAiRecommendations(dogId);
//     else loadTrailListFromServer();
//
//     $('#dogIdSelect').on('change', () => {
//         const id = $('#dogIdSelect').val();
//         loadAiRecommendations(id);
//     });
//
//     $('#loadMoreBtn').on('click', () => {
//         currentPage++;
//         renderWalkingList(true);
//     });
//
//     $('#postForm').on('submit', function (e) {
//         e.preventDefault();
//         const formData = new FormData(this);
//         $.ajax({
//             url: '/trail-posts',
//             type: 'POST',
//             data: formData,
//             processData: false,
//             contentType: false,
//             success: function () {
//                 alert("등록 완료");
//                 $('#postModal').hide();
//                 $('#postForm')[0].reset();
//                 if (allTrailsVisible) loadTrailListFromServer();
//                 const dogId = $('#dogIdSelect').val();
//                 if (dogId) loadAiRecommendations(dogId);
//             },
//             error: function () {
//                 alert("등록 실패");
//             }
//         });
//     });
//     convertAllMissingAddresses();
// });
$(document).ready(() => {
    loadTrailListFromServer();

    $('#loadMoreBtn').on('click', () => {
        currentPage++;
        renderWalkingList(true);
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
                if (allTrailsVisible) loadTrailListFromServer();
            },
            error: function () {
                alert("등록 실패");
            }
        });
    });
    convertAllMissingAddresses();
});
// ✅ 데이터 로딩 시 난이도 변환 적용
function mapTrailData(data, subtitle = "전체 코스") {
    return data.map(t => {
        return {
            title: t.name,
            subtitle,
            address: t.address || '',
            difficulty: t.difficulty || '',
            recommendedDogs: t.recommendedDogs || [],
            distance: t.lengthKm ? `${t.lengthKm.toFixed(1)}km` : '',
            startPoint: t.startPoint || '',
            endPoint: t.endPoint || '',
            rating: t.averageRating || 0,
            id: t.id,
            startLat: t.startLat,
            startLng: t.startLng
        };
    });
}
function reverseGeocode(lat, lng, callback) {
    $.ajax({
        url: `https://dapi.kakao.com/v2/local/geo/coord2address.json`,
        type: "GET",
        data: {
            x: lng,   // 경도
            y: lat    // 위도
        },
        headers: {
            "Authorization": "KakaoAK b66705bd73aeccf2de2aea6e11be2d91"
        },
        success: function(res) {
            if (res.documents && res.documents.length > 0) {
                const addr = res.documents[0].address;
                let addressStr = '';
                if (addr) {
                    addressStr = addr.region_1depth_name + ' ' + addr.region_2depth_name + ' ' + addr.region_3depth_name;
                } else if (res.documents[0].road_address) {
                    const r = res.documents[0].road_address;
                    addressStr = r.region_1depth_name + ' ' + r.region_2depth_name + ' ' + r.region_3depth_name;
                } else {
                    addressStr = "주소 변환 실패";
                }
                callback(addressStr);
            } else {
                callback("주소 변환 실패");
            }
        },
        error: function(err) {
            console.error('[KAKAO 에러]', err); // <-- 에러 메시지 꼭 확인!
            callback("주소 변환 실패");
        }
    });
}

