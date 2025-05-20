//인기 멍스타
const dogsData = [
    { name: "강군", image: '/img/강군.png', liked: true, keywords: [
            { label: "중성화", type: "white" }, { label: "외향적", type: "blue" }, { label: "다 놀아", type: "blue" }] },
    { name: "또또", image: '/../static/img/또또.png', liked: false, keywords: [
            { label: "성별", type: "white" }, { label: "차분", type: "blue" }, { label: "소형견", type: "blue" }] },
    { name: "월이", image: '/../static/img/월이.png', liked: false, keywords: [
            { label: "암컷", type: "white" }, { label: "명랑", type: "blue" }, { label: "순함", type: "blue" }] },
];

const sliderTrack = document.getElementById('sliderTrack');

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
    return card;
}

// 카드 3세트 렌더링
for (let i = 0; i < 3; i++) {
    dogsData.forEach(dog => {
        sliderTrack.appendChild(createCard(dog));
    });
}

document.addEventListener('DOMContentLoaded', () => { console.log('스크립트 로드 OK');
    document.querySelectorAll('.hart_icon').forEach(icon => {
        icon.addEventListener('click', () => {
            icon.classList.toggle('active');
        });
    });
});

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
        imgSrc: './../static/img/내향적강아지.png',
        memberImgs: [
            '/img/쪼꼬.png',
            '/../static/img/구름.png',
            '/../static/img/또또.png'
        ]
    },
    {
        id: 2,
        title: "리트리버 모임",
        subTitle: "물속성 리트리버와 산책에 빠진 모임",
        city: "잠실동",
        keywords: ["순찰", "동네 산책", "리트리버", "친목"],
        memberCount: 23,
        imgSrc: './../static/img/리트리버모임.png',
        memberImgs: [
            '/../static/img/쪼꼬.png',
            '/../static/img/구름.png',
            '/../static/img/월이.png'
        ]
    },
    {
        id: 3,
        title: "외향적 강아지 모임",
        subTitle: "우리 주인은 왜 밖으로 안나가지? 나는 나가고싶다.",
        city: "역삼동",
        keywords: ["외향적", "동네 산책", "간식 나눔", "활동적"],
        memberCount: 36,
        imgSrc: './../static/img/외향적강아지.png',
        memberImgs: [
            '/../static/img/강군.png',
            '/../static/img/또또.png',
            '/../static/img/월이.png'
        ]
    },
    {
        id: 4,
        title: "대형견 산악회",
        subTitle: "대형견과 함깨하는 등산 모임",
        city: "도봉",
        keywords: ["활동적", "등산", "국토대장정", "산 정복"],
        memberCount: 8,
        imgSrc: './../static/img/대형견산악회.png',
        memberImgs: [
            '/../static/img/쪼꼬.png',
            '/../static/img/구름.png',
            '/../static/img/월이.png'
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

// 검색 기능
document.querySelector('.search input').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value.trim().toLowerCase();

        if (searchTerm === '') {
            renderGroups(groupsData);
            return;
        }

        const searchResults = groupsData.filter(group =>
            group.title.toLowerCase().includes(searchTerm) ||
            group.subTitle.toLowerCase().includes(searchTerm) ||
            group.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        );

        renderGroups(searchResults);
    }
});

// 검색 버튼 클릭 이벤트
document.querySelector('.search button').addEventListener('click', function() {
    const searchTerm = document.querySelector('.search input').value.trim().toLowerCase();

    if (searchTerm === '') {
        renderGroups(groupsData);
        return;
    }

    const searchResults = groupsData.filter(group =>
        group.title.toLowerCase().includes(searchTerm) ||
        group.subTitle.toLowerCase().includes(searchTerm) ||
        group.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );

    renderGroups(searchResults);
});