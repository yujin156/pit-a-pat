// 더미데이터
const walkingData = [
    {
        title: "송파 둘레길 탄천길",
        subtitle: "도보코스",
        address: "서울 송파구 삼전동 185-5",
        difficulty: "보통",
        recommendedDogs: ["소형견", "중형견", "대형견"],
        distance: "6.9km",
        startPoint: "장지천합수부",
        endPoint: "청담 2교",
        rating: 4.5
    },
    {
        title: "한강공원 산책로",
        subtitle: "도보코스",
        address: "서울 영등포구 여의도동 15",
        difficulty: "쉬움",
        recommendedDogs: ["소형견", "중형견"],
        distance: "4.2km",
        startPoint: "여의나루역",
        endPoint: "마포대교",
        rating: 4.2
    },
    {
        title: "남산 둘레길",
        subtitle: "등산코스",
        address: "서울 중구 회현동 100-177",
        difficulty: "어려움",
        recommendedDogs: ["중형견", "대형견"],
        distance: "8.1km",
        startPoint: "남산공원",
        endPoint: "N서울타워",
        rating: 4.8
    },
    {
        title: "청계천 산책로",
        subtitle: "도보코스",
        address: "서울 중구 태평로1가 25",
        difficulty: "쉬움",
        recommendedDogs: ["소형견"],
        distance: "3.6km",
        startPoint: "청계광장",
        endPoint: "청계8가",
        rating: 4.1
    },
    {
        title: "올림픽공원 둘레길",
        subtitle: "도보코스",
        address: "서울 송파구 방이동 88",
        difficulty: "보통",
        recommendedDogs: ["소형견", "중형견", "대형견"],
        distance: "5.8km",
        startPoint: "올림픽공원역",
        endPoint: "몽촌토성",
        rating: 4.6
    },
    {
        title: "양재천 산책로",
        subtitle: "도보코스",
        address: "서울 서초구 양재동 232",
        difficulty: "쉬움",
        recommendedDogs: ["소형견", "중형견"],
        distance: "7.3km",
        startPoint: "양재역",
        endPoint: "탄천합류부",
        rating: 4.3
    },
    {
        title: "경의선숲길",
        subtitle: "도보코스",
        address: "서울 마포구 연남동 240",
        difficulty: "쉬움",
        recommendedDogs: ["소형견", "중형견"],
        distance: "2.8km",
        startPoint: "홍대입구역",
        endPoint: "연남동",
        rating: 4.4
    },
    {
        title: "북한산 둘레길",
        subtitle: "등산코스",
        address: "서울 강북구 수유동 산1",
        difficulty: "어려움",
        recommendedDogs: ["대형견"],
        distance: "12.3km",
        startPoint: "수유리",
        endPoint: "구기터널",
        rating: 4.7
    },
    {
        title: "보라매공원 산책로",
        subtitle: "도보코스",
        address: "서울 동작구 신대방동 395",
        difficulty: "쉬움",
        recommendedDogs: ["소형견", "중형견", "대형견"],
        distance: "3.1km",
        startPoint: "보라매공원역",
        endPoint: "중앙연못",
        rating: 4.2
    },
    {
        title: "용산가족공원",
        subtitle: "도보코스",
        address: "서울 용산구 용산동2가 8",
        difficulty: "쉬움",
        recommendedDogs: ["소형견", "중형견"],
        distance: "2.5km",
        startPoint: "용산역",
        endPoint: "가족공원",
        rating: 4.0
    },
    {
        title: "서울숲 산책로",
        subtitle: "도보코스",
        address: "서울 성동구 성수동1가 685",
        difficulty: "보통",
        recommendedDogs: ["소형견", "중형견", "대형견"],
        distance: "4.7km",
        startPoint: "서울숲역",
        endPoint: "뚝섬한강공원",
        rating: 4.5
    },
    {
        title: "월드컵공원 하늘공원",
        subtitle: "도보코스",
        address: "서울 마포구 상암동 481",
        difficulty: "보통",
        recommendedDogs: ["중형견", "대형견"],
        distance: "6.2km",
        startPoint: "월드컵경기장역",
        endPoint: "하늘공원 정상",
        rating: 4.6
    }
];

// 페이징 관련 변수
let currentPage = 1;
const itemsPerPage = 4;
let filteredData = [...walkingData];
let displayedData = [];

// 라벨 색상 클래스 매핑
const difficultyColors = {
    "쉬움": "walking_green_label",
    "보통": "walking_yellow_label",
    "어려움": "walking_red_label"
};

const dogTypeColors = {
    "소형견": "walking_green_label",
    "중형견": "walking_yellow_label",
    "대형견": "walking_red_label"
};

// 인라인 후기 작성 관련 변수
let currentInlineRating = 0;

// 별점 생성 함수
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';

    // 꽉 찬 별들
    for (let i = 0; i < fullStars; i++) {
        starsHTML += `
            <div class="one_star">
                <svg xmlns="http://www.w3.org/2000/svg" width="9.634" height="9.215" viewBox="0 0 9.634 9.215">
                    <path d="M5.283.271,6.6,2.588l2.609.535a.535.535,0,0,1,.288.885L7.7,5.973,8,8.62a.535.535,0,0,1-.753.547l-2.425-1.1-2.425,1.1A.535.535,0,0,1,1.64,8.62l.3-2.647L.141,4.007a.535.535,0,0,1,.288-.885l2.609-.535L4.352.271a.535.535,0,0,1,.931,0" transform="translate(0 -0.001)" fill="#e9b824"/>
                </svg>
            </div>
        `;
    }

    // 반 별
    if (hasHalfStar) {
        starsHTML += `
            <div class="half_star">
                <svg xmlns="http://www.w3.org/2000/svg" width="4.817" height="9.215" viewBox="0 0 4.817 9.215">
                    <path d="M4.817,0a.53.53,0,0,0-.465.271L3.037,2.587.428,3.122a.535.535,0,0,0-.288.885l1.8,1.966-.3,2.647a.535.535,0,0,0,.753.547l2.425-1.1Z" transform="translate(0)" fill="#e9b824"/>
                </svg>
            </div>
        `;
    }

    return starsHTML;
}

// 산책 코스 아이템 생성 함수
function createWalkingItem(data) {
    return `
        <div class="walking_item" data-course='${JSON.stringify(data)}'>
            <button class="review_button" onclick="toggleReviewForm(event, this)">후기 작성</button>
            <div class="walking_title_box">
                <h2 class="walking_title">${data.title}</h2>
                <p class="walking_sub_title">${data.subtitle}</p>
            </div>

            <div class="walking_address">
                <div class="map_icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="9.474" height="13" viewBox="0 0 9.474 13">
                        <g id="그룹_162517" data-name="그룹 162517" transform="translate(12 -6.5)">
                            <path id="패스_83441" data-name="패스 83441" d="M4.662,0A4.736,4.736,0,0,0,.886,7.494a39.933,39.933,0,0,1,3.1,4.963l.062.121a.779.779,0,0,0,1.384,0A41.951,41.951,0,0,1,8.6,7.481,4.736,4.736,0,0,0,4.662,0m.075,7.6A2.892,2.892,0,1,1,7.628,4.712,2.892,2.892,0,0,1,4.736,7.6" transform="translate(-12 6.5)" fill="#b7b7b7"/>
                        </g>
                    </svg>
                </div>
                <p class="map_address">${data.address}</p>
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
                        <span class="${difficultyColors[data.difficulty]}">${data.difficulty}</span>
                    </div>
                    <div class="walking_level_set">
                        <p class="recommend_dogType">추천 견종</p>
                        ${data.recommendedDogs.map(dog =>
        `<span class="${dogTypeColors[dog]}">${dog}</span>`
    ).join('')}
                    </div>
                </div>
                <div class="walking_level_row">
                    <div class="walking_level_set">
                        <p class="total_road">${data.distance}</p>
                    </div>
                    <div class="walking_level_set">
                        <span class="start_point">${data.startPoint}</span>
                        <div class="map_arrow_icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14.929" height="6.299" viewBox="0 0 14.929 6.299">
                                <g id="그룹_162518" data-name="그룹 162518" transform="translate(-5624.335 -9669.937)">
                                    <path id="패스_83436" data-name="패스 83436" d="M5647.539,9633.165l-1.425,1.425-1.018,1.018,2.442,2.442" transform="translate(-20.261 37.479)" fill="none" stroke="#b7b7b7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                    <line id="선_402" data-name="선 402" x2="12.043" transform="translate(5625.5 9673.086)" fill="none" stroke="#b7b7b7" stroke-linecap="round" stroke-width="1"/>
                                    <path id="패스_83437" data-name="패스 83437" d="M5645.1,9633.165l1.425,1.425,1.018,1.018-2.442,2.442" transform="translate(-8.774 37.479)" fill="none" stroke="#b7b7b7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                </g>
                            </svg>
                        </div>
                        <span class="end_point">${data.endPoint}</span>
                    </div>
                </div>
            </div>

            <!-- 인라인 후기 작성 폼 -->
            <div class="review_form">
                <div class="review_form_header">
                    <h4 class="review_form_title">여기 산책은 어떠셨나요?</h4>
                    <button class="close_review_btn" onclick="closeInlineReview(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="inline_rating_section">
                    <div class="inline_rating_input">
                        <p class="inline_rating_label">평점주기</p>
                        <div class="inline_star_rating">
                            <button class="inline_star_button" data-rating="1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.634 9.215">
                                    <path d="M5.283.271,6.6,2.588l2.609.535a.535.535,0,0,1,.288.885L7.7,5.973,8,8.62a.535.535,0,0,1-.753.547l-2.425-1.1-2.425,1.1A.535.535,0,0,1,1.64,8.62l.3-2.647L.141,4.007a.535.535,0,0,1,.288-.885l2.609-.535L4.352.271a.535.535,0,0,1,.931,0"/>
                                </svg>
                            </button>
                            <button class="inline_star_button" data-rating="2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.634 9.215">
                                    <path d="M5.283.271,6.6,2.588l2.609.535a.535.535,0,0,1,.288.885L7.7,5.973,8,8.62a.535.535,0,0,1-.753.547l-2.425-1.1-2.425,1.1A.535.535,0,0,1,1.64,8.62l.3-2.647L.141,4.007a.535.535,0,0,1,.288-.885l2.609-.535L4.352.271a.535.535,0,0,1,.931,0"/>
                                </svg>
                            </button>
                            <button class="inline_star_button" data-rating="3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.634 9.215">
                                    <path d="M5.283.271,6.6,2.588l2.609.535a.535.535,0,0,1,.288.885L7.7,5.973,8,8.62a.535.535,0,0,1-.753.547l-2.425-1.1-2.425,1.1A.535.535,0,0,1,1.64,8.62l.3-2.647L.141,4.007a.535.535,0,0,1,.288-.885l2.609-.535L4.352.271a.535.535,0,0,1,.931,0"/>
                                </svg>
                            </button>
                            <button class="inline_star_button" data-rating="4">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.634 9.215">
                                    <path d="M5.283.271,6.6,2.588l2.609.535a.535.535,0,0,1,.288.885L7.7,5.973,8,8.62a.535.535,0,0,1-.753.547l-2.425-1.1-2.425,1.1A.535.535,0,0,1,1.64,8.62l.3-2.647L.141,4.007a.535.535,0,0,1,.288-.885l2.609-.535L4.352.271a.535.535,0,0,1,.931,0"/>
                                </svg>
                            </button>
                            <button class="inline_star_button" data-rating="5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.634 9.215">
                                    <path d="M5.283.271,6.6,2.588l2.609.535a.535.535,0,0,1,.288.885L7.7,5.973,8,8.62a.535.535,0,0,1-.753.547l-2.425-1.1-2.425,1.1A.535.535,0,0,1,1.64,8.62l.3-2.647L.141,4.007a.535.535,0,0,1,.288-.885l2.609-.535L4.352.271a.535.535,0,0,1,.931,0"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="inline_photo_upload">
                    <div class="inline_upload_area" onclick="this.nextElementSibling.click()">
                        <svg class="inline_upload_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <p class="inline_upload_text">사진 업로드</p>
                    </div>
                    <input type="file" class="hidden_file_input" accept="image/*" multiple>
                </div>

                <div class="inline_comment_section">
                    <textarea 
                        class="inline_comment_textarea" 
                        placeholder="기억에 남는 추억이 있으셨나요?"></textarea>
                </div>

                <div class="inline_form_buttons">
                    <button class="inline_form_button inline_cancel_button" onclick="closeInlineReview(this)">취소</button>
                    <button class="inline_form_button inline_submit_button" onclick="submitInlineReview(this)">작성 완료</button>
                </div>
            </div>
        </div>
    `;
}

// 검색 기능
function filterWalkingData(searchTerm) {
    if (!searchTerm) return walkingData;

    return walkingData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// 현재 페이지까지의 데이터 가져오기
function getCurrentPageData() {
    const endIndex = currentPage * itemsPerPage;
    return filteredData.slice(0, endIndex);
}

// 더보기 버튼 상태 업데이트
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (currentPage >= totalPages) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = '모든 코스를 확인했습니다';
    } else {
        loadMoreBtn.disabled = false;
        const remainingItems = filteredData.length - (currentPage * itemsPerPage);
        loadMoreBtn.textContent = `더보기 (${remainingItems}개 더)`;
    }
}

// 리스트 렌더링 함수 수정
function renderWalkingList(append = false) {
    const walkingList = document.getElementById('walkingItemList');

    if (!append) {
        walkingList.innerHTML = '';
        currentPage = 1;
    }

    const currentData = getCurrentPageData();
    const startIndex = append ? (currentPage - 1) * itemsPerPage : 0;
    const newItems = currentData.slice(startIndex);

    const newHTML = newItems.map((item, index) => {
        const itemHTML = createWalkingItem(item);
        return itemHTML.replace('<div class="walking_item"',
            `<div class="walking_item" style="animation-delay: ${index * 0.1}s"`);
    }).join('');

    if (append) {
        walkingList.insertAdjacentHTML('beforeend', newHTML);
    } else {
        walkingList.innerHTML = newHTML;
    }

    updateLoadMoreButton();

    // 새로 추가된 아이템들에 이벤트 리스너 추가
    setTimeout(() => {
        setupNewItemsEventListeners();
    }, 100);
}

// 새로 추가된 아이템들에 이벤트 리스너 설정
function setupNewItemsEventListeners() {
    document.querySelectorAll('.walking_item').forEach(item => {
        // 이미 이벤트가 설정된 아이템은 건너뛰기
        if (item.hasAttribute('data-events-setup')) return;

        item.setAttribute('data-events-setup', 'true');

        // 별점 이벤트 리스너는 필요할 때 setupInlineStarRating에서 설정됨
    });
}

// 후기 작성 폼 토글
function toggleReviewForm(event, button) {
    event.stopPropagation();

    const walkingItem = button.closest('.walking_item');
    const reviewForm = walkingItem.querySelector('.review_form');
    const isExpanded = reviewForm.classList.contains('expanded');

    // 다른 열린 폼들 모두 닫기
    closeAllReviewForms();

    if (!isExpanded) {
        // 폼 열기
        walkingItem.classList.add('review_active');
        reviewForm.classList.add('expanded');
        button.textContent = '작성 취소';
        button.style.background = '#f5f5f5';
        button.style.color = '#666';

        // 별점 이벤트 리스너 추가
        setupInlineStarRating(walkingItem);

        // 폼이 열린 후 스크롤
        setTimeout(() => {
            reviewForm.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300);
    }
}

// 인라인 후기 폼 닫기
function closeInlineReview(element) {
    const walkingItem = element.closest('.walking_item');
    const reviewForm = walkingItem.querySelector('.review_form');
    const reviewButton = walkingItem.querySelector('.review_button');

    walkingItem.classList.remove('review_active');
    reviewForm.classList.remove('expanded');
    reviewButton.textContent = '후기 작성';
    reviewButton.style.background = '';
    reviewButton.style.color = '';

    // 폼 초기화
    resetInlineForm(walkingItem);
}

// 모든 후기 폼 닫기
function closeAllReviewForms() {
    document.querySelectorAll('.walking_item.review_active').forEach(item => {
        const reviewForm = item.querySelector('.review_form');
        const reviewButton = item.querySelector('.review_button');

        item.classList.remove('review_active');
        reviewForm.classList.remove('expanded');
        reviewButton.textContent = '후기 작성';
        reviewButton.style.background = '';
        reviewButton.style.color = '';

        resetInlineForm(item);
    });
}

// 인라인 폼 초기화
function resetInlineForm(walkingItem) {
    currentInlineRating = 0;
    const starButtons = walkingItem.querySelectorAll('.inline_star_button');
    starButtons.forEach(btn => btn.classList.remove('active'));

    const textarea = walkingItem.querySelector('.inline_comment_textarea');
    if (textarea) textarea.value = '';

    const fileInput = walkingItem.querySelector('.hidden_file_input');
    if (fileInput) fileInput.value = '';
}

// 인라인 별점 설정 함수 개선
function setupInlineStarRating(walkingItem) {
    const starButtons = walkingItem.querySelectorAll('.inline_star_button');
    const starContainer = walkingItem.querySelector('.inline_star_rating');

    if (!starContainer) return;

    // 기존 이벤트 리스너 제거를 위해 새로운 요소로 교체
    const newStarContainer = starContainer.cloneNode(true);
    starContainer.parentNode.replaceChild(newStarContainer, starContainer);

    const newStarButtons = walkingItem.querySelectorAll('.inline_star_button');

    newStarButtons.forEach(button => {
        // 클릭 이벤트
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentInlineRating = parseInt(this.dataset.rating);
            updateInlineStarDisplay(walkingItem);
        });

        // 호버 이벤트
        button.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            newStarButtons.forEach((btn, index) => {
                if (index < hoverRating) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    });

    // 마우스 나갈 때 원래 별점으로 복구
    const newStarContainerElement = walkingItem.querySelector('.inline_star_rating');
    if (newStarContainerElement) {
        newStarContainerElement.addEventListener('mouseleave', function() {
            updateInlineStarDisplay(walkingItem);
        });
    }
}

// 인라인 별점 표시 업데이트
function updateInlineStarDisplay(walkingItem) {
    const starButtons = walkingItem.querySelectorAll('.inline_star_button');
    starButtons.forEach((button, index) => {
        if (index < currentInlineRating) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 인라인 후기 제출
function submitInlineReview(button) {
    const walkingItem = button.closest('.walking_item');
    const courseData = JSON.parse(walkingItem.dataset.course);
    const comment = walkingItem.querySelector('.inline_comment_textarea').value.trim();
    const photoInput = walkingItem.querySelector('.hidden_file_input');

    if (currentInlineRating === 0) {
        alert('별점을 선택해주세요!');
        return;
    }

    if (!comment) {
        alert('후기를 작성해주세요!');
        return;
    }

    // 후기 데이터 객체
    const reviewData = {
        course: courseData,
        rating: currentInlineRating,
        comment: comment,
        photos: photoInput.files,
        timestamp: new Date().toISOString()
    };

    console.log('후기 제출:', reviewData);

    // 성공 메시지
    alert(`${courseData.title}에 대한 후기가 성공적으로 등록되었습니다!`);

    // 폼 닫기
    closeInlineReview(button);
}

// DOM 이벤트 리스너 개선
document.addEventListener('DOMContentLoaded', function() {
    // 검색 이벤트 리스너
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.trim();
            filteredData = filterWalkingData(searchTerm);
            currentPage = 1;
            renderWalkingList(false);
        });

        // 검색 입력 포커스 효과
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        searchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = '';
        });
    }

    // 더보기 버튼 이벤트 리스너
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            renderWalkingList(true);
        });
    }

    // 전역 클릭 이벤트 - 이벤트 위임 사용
    document.addEventListener('click', function(e) {
        // 후기 작성 버튼 클릭
        if (e.target.classList.contains('review_button')) {
            e.stopPropagation();
            toggleReviewForm(e, e.target);
            return;
        }

        // 후기 폼 닫기 버튼 클릭
        if (e.target.closest('.close_review_btn')) {
            e.stopPropagation();
            closeInlineReview(e.target);
            return;
        }

        // 인라인 취소 버튼 클릭
        if (e.target.classList.contains('inline_cancel_button')) {
            e.stopPropagation();
            closeInlineReview(e.target);
            return;
        }

        // 인라인 제출 버튼 클릭
        if (e.target.classList.contains('inline_submit_button')) {
            e.stopPropagation();
            submitInlineReview(e.target);
            return;
        }

        // 사진 업로드 영역 클릭
        if (e.target.closest('.inline_upload_area')) {
            const fileInput = e.target.closest('.walking_item').querySelector('.hidden_file_input');
            if (fileInput) fileInput.click();
            return;
        }

        // 산책 아이템 클릭 (후기 폼 영역 제외)
        const walkingItem = e.target.closest('.walking_item');
        if (walkingItem && !e.target.closest('.review_form') && !e.target.closest('.review_button')) {
            walkingItem.style.transform = 'scale(0.98)';
            setTimeout(() => {
                walkingItem.style.transform = '';
                console.log('산책 코스 선택됨:', walkingItem.querySelector('.walking_title').textContent);
            }, 150);
        }
    });

    // 초기 렌더링
    filteredData = [...walkingData];
    renderWalkingList();

    // 스크롤 애니메이션 효과
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 모든 .walking_item 요소 관찰
    setTimeout(() => {
        document.querySelectorAll('.walking_item').forEach(item => {
            observer.observe(item);
        });
    }, 100);
});