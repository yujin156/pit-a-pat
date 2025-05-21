// 반응형일때, 로그인박스 사라지게하는거



//인기 멍스타
const dogsData = [
    { name: "강군", image: '/img/강군.png', liked: true, keywords: [
            { label: "중성화", type: "white" }, { label: "외향적", type: "blue" }, { label: "다 놀아", type: "blue" }] },
    { name: "또또", image: '/img/또또.png', liked: false, keywords: [
            { label: "성별", type: "white" }, { label: "차분", type: "blue" }, { label: "소형견", type: "blue" }] },
    { name: "월이", image: '/img/월이.png', liked: false, keywords: [
            { label: "암컷", type: "white" }, { label: "명랑", type: "blue" }, { label: "순함", type: "blue" }] },
];


// /////////////////////////////
// //////슬라이드 파트/////////////
// /////////////////////////////
// 강아지 카드 생성 함수
function createCard(dog) {
    const card = document.createElement('div');
    card.className = 'p_dog';
    card.innerHTML = `
            <div class="dog_img" style="background-image: url('${dog.image}')"></div>
            <div class="name_hart">
              <span class="dog_name">${dog.name}</span>
              <div class="hart_icon${dog.liked ? ' active' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22.903 20.232">
                  <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06a5.5,5.5,0,0,0,0-7.78Z"
                  transform="translate(-1.549 -2.998)" fill="inherit" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </svg>
              </div>
            </div>
            <div class="keyword">
              ${dog.keywords.map(k => `<span class="${k.type === 'white' ? 'white_label' : 'blue_label'}">${k.label}</span>`).join('')}
            </div>
        `;

    // 마우스 이벤트 추가
    card.addEventListener('mouseenter', stopAutoSlide);
    card.addEventListener('mouseleave', startAutoSlide);

    return card;
}

// 슬라이더 초기화
const sliderTrack = document.getElementById('sliderTrack');

// 카드 3세트 렌더링
for (let i = 0; i < 3; i++) {
    dogsData.forEach(dog => {
        sliderTrack.appendChild(createCard(dog));
    });
}

// 하트 아이콘 이벤트리스너
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hart_icon').forEach(icon => {
        icon.addEventListener('click', (event) => {
            // 이벤트 버블링 방지
            event.stopPropagation();
            icon.classList.toggle('active');
        });
    });
});

// 슬라이드 기능 구현
let position = 0;
let cardWidth = 300; // 카드 너비 + 여백
let cardCount = dogsData.length;
let isAnimating = false;
let autoSlideInterval;

// 슬라이드 이동 함수
function slideNext() {
    if (isAnimating) return;
    isAnimating = true;

    position -= cardWidth;

    // 모든 카드가 왼쪽으로 이동한 경우 (1세트가 완전히 지나간 경우)
    if (Math.abs(position) >= cardWidth * cardCount) {
        // 부드럽게 진행되도록 애니메이션은 계속 실행
        sliderTrack.style.transition = 'left 0.5s ease';
        sliderTrack.style.left = position + 'px';

        // 애니메이션이 끝나면 처음 위치로 즉시 이동 (눈에 안보이게)
        setTimeout(() => {
            sliderTrack.style.transition = 'none';
            position = 0;
            sliderTrack.style.left = position + 'px';

            // 다음 애니메이션을 위해 transition 복원
            setTimeout(() => {
                sliderTrack.style.transition = 'left 0.5s ease';
                isAnimating = false;
            }, 50);
        }, 3000);
    } else {
        // 일반적인 슬라이드 이동
        sliderTrack.style.transition = 'left 0.5s ease';
        sliderTrack.style.left = position + 'px';

        // 애니메이션 완료 후 상태 업데이트
        setTimeout(() => {
            isAnimating = false;
        }, 3000);
    }
}

// 자동 슬라이드 시작
function startAutoSlide() {
    if (!autoSlideInterval) {
        autoSlideInterval = setInterval(slideNext, 3000);
    }
}

// 자동 슬라이드 정지
function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// 마우스 이벤트
const slider_outer = document.querySelector('.slider_outer');
slider_outer.addEventListener('mouseenter', stopAutoSlide);
slider_outer.addEventListener('mouseleave', startAutoSlide);

// 초기 자동 슬라이드 시작
startAutoSlide();

// 윈도우 크기 변경 시 카드 너비 재계산
window.addEventListener('resize', () => {
    // 실제 환경에서는 여기서 cardWidth 재계산 로직 추가
});


// /////////////////////////////
// /////////////////////////////

// 모임//////////
// 모임 데이터 배열
const groupsData = [
    {
        id: 1,
        title: "내향적 강아지 모임",
        subTitle: "주인이 끌고 와서 억지로 여기 있는 거다",
        city: "역삼동",
        keywords: ["내향적", "동네 산책", "간식 나눔", "침목"],
        memberCount: 12,
        imgSrc: './img/내향적강아지.png',
        memberImgs: [
            '/img/쪼꼬.png',
            '/img/구름.png',
            '/img/또또.png'
        ]
    },
    {
        id: 2,
        title: "리트리버 모임",
        subTitle: "물속성 리트리버와 산책에 빠진 모임",
        city: "잠실동",
        keywords: ["순찰", "동네 산책", "리트리버", "친목"],
        memberCount: 23,
        imgSrc: './img/리트리버모임.png',
        memberImgs: [
            '/img/쪼꼬.png',
            '/img/구름.png',
            '/img/월이.png'
        ]
    },
    {
        id: 3,
        title: "외향적 강아지 모임",
        subTitle: "우리 주인은 왜 밖으로 안나가지? 나는 나가고싶다.",
        city: "역삼동",
        keywords: ["외향적", "동네 산책", "간식 나눔", "활동적"],
        memberCount: 36,
        imgSrc: './img/외향적강아지.png',
        memberImgs: [
            '/img/강군.png',
            '/img/또또.png',
            '/img/월이.png'
        ]
    },
    {
        id: 4,
        title: "대형견 산악회",
        subTitle: "대형견과 함깨하는 등산 모임",
        city: "도봉",
        keywords: ["활동적", "등산", "국토대장정", "산 정복"],
        memberCount: 8,
        imgSrc: './img/대형견산악회.png',
        memberImgs: [
            '/img/쪼꼬.png',
            '/img/구름.png',
            '/img/월이.png'
        ]
    }
];

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // 모임 카드 생성 및 표시
    renderGroups(groupsData);
});

// 모임 카드 렌더링 함수
function renderGroups(groups) {
    const dog_group = document.getElementById('D_group');
    dog_group.innerHTML = '';

    groups.forEach(group => {
        const groupElement = createGroupElement(group);
        dog_group.appendChild(groupElement);
    });
}

// 모임 카드 엘리먼트 생성 함수
function createGroupElement(group) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group';

    // 회원 프로필 이미지 HTML 생성
    let membersHTML = '';

    group.memberImgs.forEach(img => {
        membersHTML += `<div class="member1" style="background-image: url('${img}');"></div>`;
    });
    membersHTML += `<div class="more-members">...</div>`;

    // 키워드 분리
    const cityTag = `<label class="g_city">${group.city}</label>`;
    let keywordsHTML1 = '';
    let keywordsHTML2 = '';

    group.keywords.forEach((keyword, index) => {
        if (index < 2) {
            keywordsHTML1 += `<label class="g_label">${keyword}</label>`;
        } else {
            keywordsHTML2 += `<label class="g_label">${keyword}</label>`;
        }
    });

    // 그룹 카드 내용 구성
    groupDiv.innerHTML = `
        <div class="group_list">
            <div class="group1">
                <div class="groupImg" style="background-image: url('${group.imgSrc}');"></div>
                <div class="groupInfo">
                    <div>
                        <div class="g_title">${group.title}</div>
                        <div class="g_sub_title">${group.subTitle}</div>
                        <div class="g_keyword1">
                            ${cityTag}
                            ${keywordsHTML1}
                        </div>
                        <div class="g_keyword2">
                            ${keywordsHTML2}
                        </div>
                    </div>
                    <div>
                        <div class="g_member">
                            ${membersHTML}
                        </div>
                        <div class="g_member_count">${group.memberCount}명 참여 중</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return groupDiv;
}

// 필터링 함수
function filterGroups(category) {
    if (category === 'all') {
        renderGroups(groupsData);
        return;
    }

    const filteredGroups = groupsData.filter(group => group.category === category);
    renderGroups(filteredGroups);
}


