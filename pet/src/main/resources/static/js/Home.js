document.addEventListener('DOMContentLoaded', () => {
    const dogsData = [
        {
            name: "존",
            image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            liked: false,
            keywords: [
                {label: "수컷", type: "white"}, {label: "외향적", type: "blue"}, {label: "리트리버", type: "blue"}]
        },
        {
            name: "흰둥이",
            image: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            liked: false,
            keywords: [
                {label: "암컷", type: "white"}, {label: "내향적", type: "blue"}, {label: "사모에드", type: "blue"}]
        },
        {
            name: "니키",
            image: 'https://plus.unsplash.com/premium_photo-1668208363137-7ebc4ce6b7b7?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            liked: false,
            keywords: [
                {label: "암컷", type: "white"}, {label: "명랑", type: "blue"}, {label: "허스키", type: "blue"}]
        },
        {
            name: "송나라",
            image: 'https://images.unsplash.com/photo-1554692936-82776f9406db?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            liked: false,
            keywords: [
                {label: "수컷", type: "white"}, {label: "시끄러움", type: "blue"}, {label: "웰시코기", type: "blue"}]
        },
        {
            name: "퀸",
            image: 'https://mblogthumb-phinf.pstatic.net/MjAxOTA4MzBfNjEg/MDAxNTY3MTMzNzYyNzY2.eyb73y7O5PpCgCJ9gcJOemdDIJ6kT2q2Z4220vwURecg.uRtsnyGdqSryZtmTAcw_SwtC67P-mHBX-we4TSlcm24g.PNG.abcdhan87/20190830113953.png?type=w800',
            liked: false,
            keywords: [
                {label: "수컷", type: "white"}, {label: "까칠함", type: "blue"}, {label: "그레이 하운드", type: "blue"}]
        },
        {
            name: "가을",
            image: 'https://images.unsplash.com/photo-1689202067149-883eb05b21bb?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            liked: false,
            keywords: [
                {label: "암컷", type: "white"}, {label: "명랑", type: "blue"}, {label: "비글", type: "blue"}]
        }
    ];
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
            imgSrc: 'https://images.unsplash.com/photo-1638766211853-3e0dd41cbc41?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            memberImgs: [
                '/img/쪼꼬.png',
                '/img/구름.png',
                '/img/월이.png'
            ]
        }
    ];

    const slider_outer = document.querySelector('.slider_outer');
    const sliderTrack = document.getElementById('sliderTrack');
    const cardWidth = 320;

    // 카드 생성 (원본 + 복제)
    dogsData.forEach(dog => sliderTrack.appendChild(createCard(dog)));
    dogsData.forEach(dog => sliderTrack.appendChild(createCard(dog)));

    const cardCount = dogsData.length;
    const totalCount = cardCount * 2;
    sliderTrack.style.width = `${totalCount * cardWidth}px`;

    let position = 0;
    let isAnimating = false;

    function slideNext() {
        if (isAnimating) return;
        isAnimating = true;
        position -= cardWidth;
        sliderTrack.style.transition = 'left 0.5s ease';
        sliderTrack.style.left = `${position}px`;

        if (Math.abs(position) >= cardWidth * cardCount) {
            setTimeout(() => {
                sliderTrack.style.transition = 'none';
                position = 0;
                sliderTrack.style.left = '0px';
                setTimeout(() => {
                    sliderTrack.style.transition = 'left 0.5s ease';
                    isAnimating = false;
                }, 50);
            }, 500);
        } else {
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }
    }

    let autoSlide = setInterval(slideNext, 2000);
    slider_outer.addEventListener('mouseenter', () => clearInterval(autoSlide));
    slider_outer.addEventListener('mouseleave', () => {
        autoSlide = setInterval(slideNext, 2000);
    });

    // 드래그 슬라이드
    let isDragging = false;
    let startX = 0;
    let currentLeft = 0;

    slider_outer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        currentLeft = parseInt(getComputedStyle(sliderTrack).left) || 0;
        clearInterval(autoSlide);
        sliderTrack.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        sliderTrack.style.left = `${currentLeft + dx}px`;
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        const moved = parseInt(sliderTrack.style.left) || 0;
        let newLeft = Math.round(moved / cardWidth) * cardWidth;
        const maxLeft = -cardWidth * (totalCount - 1);
        if (newLeft > 0) newLeft = 0;
        if (newLeft < maxLeft) newLeft = maxLeft;
        position = newLeft;
        sliderTrack.style.transition = 'left 0.3s ease';
        sliderTrack.style.left = `${position}px`;
        autoSlide = setInterval(slideNext, 2000);
    });

    document.querySelectorAll('.hart_icon').forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            icon.classList.toggle('active');
        });
    });

    // ✅ 그룹 렌더링 꼭 여기서!
    renderGroups(groupsData);
});

// 카드 생성 함수
function createCard(dog) {
    const card = document.createElement('div');
    card.className = 'p_dog';
    card.innerHTML = `
    <div class="dog_img" style="background-image: url('${dog.image}')"></div>
    <div class="name_hart">
      <span class="dog_name">${dog.name}</span>
      <div class="hart_icon${dog.liked ? ' active' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="30" viewBox="0 0 22.903 20.232">
          <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06a5.5,5.5,0,0,0,0-7.78Z"
            transform="translate(-1.549 -2.998)" fill="inherit" stroke="none" stroke-width="2"/>
        </svg>
      </div>
    </div>
    <div class="keyword">
      ${dog.keywords.map(k => `<span class="${k.type === 'white' ? 'white_label' : 'blue_label'}">${k.label}</span>`).join('')}
    </div>
  `;
    return card;
}

// 그룹 렌더링 함수
function renderGroups(groups) {
    const dog_group = document.getElementById('D_group');
    if (!dog_group) return;
    dog_group.innerHTML = '';

    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group';

        const membersHTML = group.memberImgs.map(img =>
            `<div class="member1" style="background-image: url('${img}');"></div>`
        ).join('') + `<div class="more-members">...</div>`;

        const cityTag = `<label class="g_city">${group.city}</label>`;
        const keywordsHTML1 = group.keywords.slice(0, 2).map(k => `<label class="g_label">${k}</label>`).join('');
        const keywordsHTML2 = group.keywords.slice(2).map(k => `<label class="g_label">${k}</label>`).join('');

        groupDiv.innerHTML = `
      <div class="group_list">
        <div class="group1">
          <div class="groupImg" style="background-image: url('${group.imgSrc}');"></div>
          <div class="groupInfo">
            <div>
              <div class="g_title">${group.title}</div>
              <div class="g_sub_title">${group.subTitle}</div>
              <div class="g_keyword1">${cityTag}${keywordsHTML1}</div>
              <div class="g_keyword2">${keywordsHTML2}</div>
            </div>
            <div>
              <div class="g_member">${membersHTML}</div>
              <div class="g_member_count">${group.memberCount}명 참여 중</div>
            </div>
          </div>
        </div>
      </div>
    `;
        dog_group.appendChild(groupDiv);
    });
}

