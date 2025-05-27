console.log('반려견 소셜 미팅 플랫폼 JavaScript 로드됨');

// DOM 요소들
const navButtons = document.querySelectorAll('.myPage_nav-btn');
const tabContents = document.querySelectorAll('.myPage_tab_content');
const tabToggleButtons = document.querySelectorAll('.myPage_tab_toggle');
const toggleContents = document.querySelectorAll('.myPage_toggle_content');

// 모달 관련 변수들
let currentStep = 1;
let selectedSize = '';
let selectedKeywords = [];
let dogProfileData = {};
let dogProfiles = []; // 저장된 프로필들
let uploadedImageData = null;

// 데이터 템플릿들
const postsData = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
        title: '한강공원 산책 모임',
        description: '한강공원에서 강아지들과 함께 즐거운 산책을 해요! 사회성 기르기에 좋은 기회입니다. 매주 토요일 오후 2시에 만나요.',
        participants: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=30&h=30&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=30&h=30&fit=crop&crop=face'
        ]
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop',
        title: '해변 산책 모임',
        description: '바다에서 강아지들과 함께 즐거운 시간을 보내요! 파도 소리를 들으며 산책하면서 새로운 친구들을 만나봐요',
        participants: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=30&h=30&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=30&h=30&fit=crop&crop=face'
        ]
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
        title: '강아지 놀이 모임',
        description: '넓은 공원에서 강아지들이 마음껏 뛰어놀 수 있는 모임입니다. 사회성 기르기에 좋아요!',
        participants: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=30&h=30&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=30&h=30&fit=crop&crop=face'
        ]
    }
];

const commentsData = [
    {
        id: 1,
        username: 'DogUser',
        text: '안녕하세요 :)',
        description: '우리 강아지가 정말 즐거워했어요. 다음에도 참여하고 싶습니다!',
        date: '2025년 5월 24일 오후 2시',
        linkedPost: {
            image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=40&h=40&fit=crop',
            title: '한강공원 산책 모임'
        }
    },
    {
        id: 2,
        username: 'PuppyLover',
        text: '너무 좋은 모임이에요!',
        description: '우리 강아지가 정말 즐거워했어요. 다음에도 꼭 참여하고 싶습니다',
        date: '2025년 5월 23일 오후 5시',
        linkedPost: {
            image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=40&h=40&fit=crop',
            title: '해변 산책 모임'
        }
    },
    {
        id: 3,
        username: 'DogMom',
        text: '추천해요!',
        description: '새로운 친구들을 많이 만날 수 있어서 좋았어요. 강아지 사회성에도 도움이 되는 것 같아요',
        date: '2025년 5월 22일 오전 10시',
        linkedPost: {
            image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=40&h=40&fit=crop',
            title: '강아지 놀이 모임'
        }
    }
];

const bookmarksData = [
    {
        type: 'social',
        id: 1,
        user: {
            name: 'Dog_writer',
            profileImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=40&h=40&fit=crop&crop=face',
            timeAgo: '1일 전'
        },
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop',
        likes: 15,
        content: '우리 강아지가 너무 귀여워요! 🐕',
        comments: 4
    },
    {
        type: 'post',
        id: 2,
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
        title: '한강공원 산책 모임',
        description: '한강공원에서 강아지들과 함께 즐거운 산책을 해요!',
        participants: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=30&h=30&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=30&h=30&fit=crop&crop=face'
        ]
    }
];

// SVG 아이콘들
const SVG_ICONS = {
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
        <path d="M5.5,1a4.5,4.5,0,0,0-3.2,1.3c-1.8,1.8-1.8,4.6,0,6.4L10,16.4,17.7,8.7c1.8-1.8,1.8-4.6,0-6.4s-4.6-1.8-6.4,0L10,3.6,8.7,2.3A4.5,4.5,0,0,0,5.5,1Z" fill="none" stroke="#666" stroke-width="1.5"/>
    </svg>`,
    comment: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <path d="M2,2H18a2,2,0,0,1,2,2V12a2,2,0,0,1-2,2H6l-4,4V4A2,2,0,0,1,2,2Z" fill="none" stroke="#666" stroke-width="1.5"/>
    </svg>`,
    bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
        <path d="M2,2V18l6-4,6,4V2A2,2,0,0,0,12,0H4A2,2,0,0,0,2,2Z" fill="none" stroke="#666" stroke-width="1.5"/>
    </svg>`
};

// 템플릿 생성 함수들
function createPostCard(post) {
    const participantsHTML = post.participants.map(avatar =>
        `<img src="${avatar}" alt="참가자" class="myPage_participant_avatar">`
    ).join('');

    return `
        <article class="myPage_post_card" data-post-id="${post.id}">
            <img src="${post.image}" alt="${post.title}" class="myPage_post_image">
            <div class="myPage_post_content">
                <h3>${post.title}</h3>
                <p class="myPage_post_description">${post.description}</p>
                <div class="myPage_post_participants">
                    ${participantsHTML}
                </div>
            </div>
            <button class="myPage_post_menu">⋯</button>
        </article>
    `;
}

function createCommentCard(comment) {
    return `
        <article class="myPage_comment_card" data-comment-id="${comment.id}">
            <div class="myPage_comment_header">
                <span class="myPage_username">${comment.username}</span>
                <span class="myPage_comment_label">댓글</span>
            </div>
            <div class="myPage_comment_content">
                <p class="myPage_comment_text">${comment.text}</p>
                <p class="myPage_comment_description">${comment.description}</p>
                <p class="myPage_comment_date">${comment.date}</p>
                <div class="myPage_linked_post">
                    <img src="${comment.linkedPost.image}" alt="관련 게시글" class="myPage_linked_post_image">
                    <span class="myPage_linked_post_title">${comment.linkedPost.title}</span>
                </div>
            </div>
            <button class="myPage_comment_menu">⋯</button>
        </article>
    `;
}

function createSocialPost(item) {
    return `
        <article class="myPage_social_post" data-social-id="${item.id}">
            <div class="myPage_post_writer">
                <div class="myPage_writer">
                    <div class="myPage_post_user_info">
                        <div class="myPage_post_profile_img">
                            <img src="${item.user.profileImage}" alt="${item.user.name}">
                        </div>
                        <div class="post_user_details">
                            <div class="board_write_user">${item.user.name}</div>
                            <span class="board_write_time">${item.user.timeAgo}</span>
                        </div>
                    </div>
                    <div class="post_menu_btn">⋯</div>
                </div>
                <div class="board_post_img">
                    <img src="${item.image}" alt="게시물 이미지">
                </div>
                <div class="board_svg_row">
                    <div class="post_right_nav">
                        <div class="post_heart_icon">
                            ${SVG_ICONS.heart}
                        </div>
                        <div class="post_comment_icon">
                            ${SVG_ICONS.comment}
                        </div>
                    </div>
                    <div class="post_bookmark_icon active">
                        ${SVG_ICONS.bookmark}
                    </div>
                </div>
                <div class="post_content_section">
                    <span class="post_who_like">좋아요 ${item.likes}개</span>
                    <div class="post_content">
                        <span class="post_username">${item.user.name}</span>
                        <span class="post_text">${item.content}</span>
                    </div>
                    <span class="post_comment_count">댓글 ${item.comments}개 모두 보기</span>
                </div>
            </div>
        </article>
    `;
}

function createBookmarkPost(item) {
    const participantsHTML = item.participants.map(avatar =>
        `<img src="${avatar}" alt="참가자" class="myPage_participant_avatar">`
    ).join('');

    return `
        <article class="myPage_post_card" data-post-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" class="myPage_post_image">
            <div class="myPage_post_content">
                <h3>${item.title}</h3>
                <p class="myPage_post_description">${item.description}</p>
                <div class="myPage_post_participants">
                    ${participantsHTML}
                </div>
            </div>
            <button class="myPage_post_menu">⋯</button>
        </article>
    `;
}

function createDogProfileCard(profile) {
    return `
        <div class="myPage_dog_card" data-profile-id="${profile.id}">
            <img src="${profile.image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face'}" 
                 alt="${profile.name}" class="dog-image">
            <div class="myPage_dog_info">
                <h4>${profile.name}</h4>
                <p>${getSizeLabel(profile.size)} ${profile.breed} ${profile.gender === 'male' ? '수컷' : '암컷'}</p>
            </div>
            <button class="myPage_dog_more_btn" onclick="showDogProfileMenu(event, ${profile.id})">⋯</button>
        </div>
    `;
}

// 헬퍼 함수들
function getSizeLabel(size) {
    const sizeLabels = {
        'small': '소형견',
        'medium': '중형견',
        'large': '대형견'
    };
    return sizeLabels[size] || size;
}

function calculateAge(birthYear) {
    if (!birthYear) return '알 수 없음';
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthYear);
}

// 콘텐츠 렌더링 함수들
function renderPosts() {
    const container = document.getElementById('posts-container');
    if (container) {
        container.innerHTML = postsData.map(post => createPostCard(post)).join('');
        attachPostEventListeners();
    }
}

function renderComments() {
    const container = document.getElementById('comments-container');
    if (container) {
        container.innerHTML = commentsData.map(comment => createCommentCard(comment)).join('');
        attachCommentEventListeners();
    }
}

function renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    if (container) {
        const bookmarksHTML = bookmarksData.map(item => {
            if (item.type === 'social') {
                return createSocialPost(item);
            } else if (item.type === 'post') {
                return createBookmarkPost(item);
            }
            return '';
        }).join('');
        container.innerHTML = bookmarksHTML;
        attachBookmarkEventListeners();
    }
}

function renderDogProfiles() {
    const profilesContainer = document.querySelector('.myPage_dog_profiles');
    if (!profilesContainer) return;

    // 기존 프로필 카드들 제거 (추가 버튼은 유지)
    const existingCards = profilesContainer.querySelectorAll('.myPage_dog_card');
    existingCards.forEach(card => card.remove());

    // 새 프로필 카드들 추가
    const addButton = profilesContainer.querySelector('.myPage_add_profile');
    if (addButton) {
        dogProfiles.forEach(profile => {
            const profileHTML = createDogProfileCard(profile);
            addButton.insertAdjacentHTML('beforebegin', profileHTML);
        });
    }
}

// 이벤트 리스너 부착 함수들
function attachPostEventListeners() {
    document.querySelectorAll('.myPage_post_card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.myPage_post_menu')) return;
            const postId = card.dataset.postId;
            const title = card.querySelector('h3').textContent;
            alert(`"${title}" 게시글 상세보기로 이동합니다. (ID: ${postId})`);
        });
    });

    document.querySelectorAll('.myPage_post_menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, 'post');
        });
    });

    attachAvatarHoverEffects();
}

function attachCommentEventListeners() {
    document.querySelectorAll('.myPage_comment_card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.myPage_comment_menu')) return;
            const commentId = card.dataset.commentId;
            const linkedPost = card.querySelector('.myPage_linked_post_title').textContent;
            alert(`"${linkedPost}" 게시글로 이동합니다. (댓글 ID: ${commentId})`);
        });
    });

    document.querySelectorAll('.myPage_comment_menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, 'comment');
        });
    });

    document.querySelectorAll('.myPage_linked_post').forEach(post => {
        post.addEventListener('click', (e) => {
            e.stopPropagation();
            const title = post.querySelector('.myPage_linked_post_title').textContent;
            alert(`"${title}" 원본 게시글로 이동합니다.`);
        });
    });
}

function attachBookmarkEventListeners() {
    document.querySelectorAll('.post_heart_icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const heartPath = btn.querySelector('path');
            if (heartPath) {
                const currentFill = heartPath.getAttribute('fill');
                if (currentFill === 'none' || !currentFill) {
                    heartPath.setAttribute('fill', '#ff6b6b');
                    heartPath.setAttribute('stroke', '#ff6b6b');
                } else {
                    heartPath.setAttribute('fill', 'none');
                    heartPath.setAttribute('stroke', '#666');
                }
            }
        });
    });

    document.querySelectorAll('.post_bookmark_icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('active');
        });
    });

    document.querySelectorAll('.post_comment_count').forEach(count => {
        count.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('댓글 상세보기로 이동합니다.');
        });
    });

    document.querySelectorAll('.post_who_like').forEach(count => {
        count.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('좋아요한 사용자 목록을 보여줍니다.');
        });
    });

    document.querySelectorAll('.board_post_img img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('이미지를 확대해서 보여줍니다.');
        });
    });

    document.querySelectorAll('.myPage_post_profile_img img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const username = img.closest('.myPage_post_user_info').querySelector('.board_write_user').textContent;
            alert(`${username}의 프로필로 이동합니다.`);
        });
    });

    document.querySelectorAll('.post_menu_btn, .myPage_post_menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, 'social');
        });
    });

    attachAvatarHoverEffects();
}

function attachAvatarHoverEffects() {
    document.querySelectorAll('.myPage_participant_avatar').forEach(avatar => {
        avatar.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.transition = 'transform 0.2s ease';
        });

        avatar.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'scale(1)';
        });
    });
}

// 탭 전환 함수
function switchTab(targetTab) {
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    const clickedButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    const targetContent = document.getElementById(targetTab === 'profile' ? 'myPage_profile' : targetTab);
    if (targetContent) {
        targetContent.classList.add('active');
        console.log(`탭 "${targetTab}" 활성화됨`);
    }

    if (targetTab === 'posts') {
        switchToggle('posts-content');
    } else if (targetTab === 'bookmarks') {
        renderBookmarks();
    }
}

// 토글 전환 함수 (게시글/댓글)
function switchToggle(targetToggle) {
    tabToggleButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    toggleContents.forEach(content => {
        content.classList.remove('active');
    });

    const clickedToggle = document.querySelector(`[data-toggle="${targetToggle}"]`);
    if (clickedToggle) {
        clickedToggle.classList.add('active');
    }

    const targetContent = document.getElementById(targetToggle);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    if (targetToggle === 'posts-content') {
        renderPosts();
    } else if (targetToggle === 'comments-content') {
        renderComments();
    }
}

// 프로필 추가 모달 관련 함수들
function openProfileModal() {
    console.log('모달 열기 시도');
    const modal = document.getElementById('profileModal');

    if (!modal) {
        console.error('모달 요소를 찾을 수 없습니다');
        return;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    currentStep = 1;
    showStep(1);
    initializeBirthdaySelects();
    initializeImageUpload();

    console.log('모달 열림 완료');
}

function closeModal() {
    console.log('모달 닫기 시도');
    const modal = document.getElementById('profileModal');

    if (!modal) {
        console.error('모달 요소를 찾을 수 없습니다');
        return;
    }

    modal.style.display = 'none';
    document.body.style.overflow = '';
    resetModalData();

    console.log('모달 닫힘 완료');
}

function resetModalData() {
    currentStep = 1;
    selectedSize = '';
    selectedKeywords = [];
    dogProfileData = {};
    uploadedImageData = null;

    // 폼 초기화
    const dogNameInput = document.getElementById('dogName');
    const dogGenderSelect = document.getElementById('dogGender');
    const dogBreedInput = document.getElementById('dogBreed');
    const dogIntroInput = document.getElementById('dogIntroduction');
    const birthYearSelect = document.getElementById('birthYear');
    const birthMonthSelect = document.getElementById('birthMonth');
    const birthDaySelect = document.getElementById('birthDay');

    if (dogNameInput) dogNameInput.value = '';
    if (dogGenderSelect) dogGenderSelect.value = '';
    if (dogBreedInput) dogBreedInput.value = '';
    if (dogIntroInput) dogIntroInput.value = '';
    if (birthYearSelect) birthYearSelect.value = '';
    if (birthMonthSelect) birthMonthSelect.value = '';
    if (birthDaySelect) birthDaySelect.value = '';

    // 크기 선택 초기화
    document.querySelectorAll('.size_card').forEach(card => {
        card.classList.remove('selected');
    });

    // 키워드 선택 초기화
    document.querySelectorAll('.keyword_btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // 이미지 업로드 초기화
    const uploadArea = document.getElementById('imageUploadArea');
    if (uploadArea) {
        uploadArea.classList.remove('has_image');
        uploadArea.innerHTML = `
            <svg class="upload_icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
            </svg>
            <p>강아지 사진 올리기</p>
        `;
    }

    // 버튼 상태 초기화
    updateNextButtonState();
}

function showStep(step) {
    document.querySelectorAll('.modal_step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });

    const targetStep = document.getElementById(`step${step}`);
    if (targetStep) {
        targetStep.classList.add('active');
        currentStep = step;
    }
}

function nextStep() {
    if (currentStep === 1) {
        if (!validateStep1()) return;
        saveStep1Data();
        showStep(2);
        updateNextButtonState();
    } else if (currentStep === 2) {
        if (!validateStep2()) return;
        saveStep2Data();
        showStep(3);
    }
}

function prevStep() {
    if (currentStep === 2) {
        showStep(1);
    } else if (currentStep === 3) {
        showStep(2);
        updateNextButtonState();
    }
}

function validateStep1() {
    if (!selectedSize) {
        alert('강아지 크기를 선택해주세요.');
        return false;
    }
    return true;
}

function validateStep2() {
    const dogName = document.getElementById('dogName').value.trim();
    const dogGender = document.getElementById('dogGender').value;
    const dogBreed = document.getElementById('dogBreed').value.trim();
    const birthYear = document.getElementById('birthYear').value;

    if (!dogName) {
        alert('반려견 이름을 입력해주세요.');
        return false;
    }

    if (!dogGender) {
        alert('성별을 선택해주세요.');
        return false;
    }

    if (!dogBreed) {
        alert('견종을 입력해주세요.');
        return false;
    }

    if (!birthYear) {
        alert('생년월일을 선택해주세요.');
        return false;
    }

    return true;
}

function saveStep1Data() {
    dogProfileData.size = selectedSize;
}

function saveStep2Data() {
    dogProfileData.name = document.getElementById('dogName').value.trim();
    dogProfileData.gender = document.getElementById('dogGender').value;
    dogProfileData.breed = document.getElementById('dogBreed').value.trim();
    dogProfileData.introduction = document.getElementById('dogIntroduction').value.trim();
    dogProfileData.birthYear = document.getElementById('birthYear').value;
    dogProfileData.birthMonth = document.getElementById('birthMonth').value;
    dogProfileData.birthDay = document.getElementById('birthDay').value;
    dogProfileData.image = uploadedImageData;
}

function updateNextButtonState() {
    const nextBtn1 = document.getElementById('nextStep1');
    const nextBtn2 = document.getElementById('nextStep2');

    if (nextBtn1) {
        nextBtn1.disabled = !selectedSize;
    }

    if (nextBtn2) {
        const dogName = document.getElementById('dogName')?.value.trim();
        const dogGender = document.getElementById('dogGender')?.value;
        const dogBreed = document.getElementById('dogBreed')?.value.trim();
        const birthYear = document.getElementById('birthYear')?.value;

        nextBtn2.disabled = !dogName || !dogGender || !dogBreed || !birthYear;
    }
}

function initializeBirthdaySelects() {
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');

    if (!yearSelect || !monthSelect || !daySelect) return;

    // 연도 옵션 추가 (현재 연도부터 20년 전까지)
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '<option value="">생년</option>';
    for (let year = currentYear; year >= currentYear - 20; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '년';
        yearSelect.appendChild(option);
    }

    // 월 옵션 추가
    monthSelect.innerHTML = '<option value="">월</option>';
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month + '월';
        monthSelect.appendChild(option);
    }

    // 일 옵션 추가
    const updateDays = () => {
        const selectedYear = parseInt(yearSelect.value);
        const selectedMonth = parseInt(monthSelect.value);

        daySelect.innerHTML = '<option value="">일</option>';

        if (selectedYear && selectedMonth) {
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = day + '일';
                daySelect.appendChild(option);
            }
        }
    };

    yearSelect.addEventListener('change', () => {
        updateDays();
        updateNextButtonState();
    });
    monthSelect.addEventListener('change', () => {
        updateDays();
        updateNextButtonState();
    });
    daySelect.addEventListener('change', updateNextButtonState);

    // 다른 입력 필드들도 변화 감지
    document.getElementById('dogName')?.addEventListener('input', updateNextButtonState);
    document.getElementById('dogGender')?.addEventListener('change', updateNextButtonState);
    document.getElementById('dogBreed')?.addEventListener('input', updateNextButtonState);
}

function initializeImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('dogImageInput');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImageData = e.target.result;
                uploadArea.classList.add('has_image');
                uploadArea.innerHTML = `<img src="${e.target.result}" alt="업로드된 이미지" class="uploaded_image">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 드래그 앤 드롭 기능
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.background = '#f0f7ff';
        uploadArea.style.borderColor = '#4285f4';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.background = '#f8f9fa';
        uploadArea.style.borderColor = '#ddd';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.background = '#f8f9fa';
        uploadArea.style.borderColor = '#ddd';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                fileInput.files = files;
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        }
    });
}

function initializeSizeSelection() {
    document.querySelectorAll('.size_card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.size_card').forEach(c => {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            selectedSize = card.dataset.size;
            updateNextButtonState();
        });
    });
}

function initializeKeywordSelection() {
    document.querySelectorAll('.keyword_btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const keyword = btn.dataset.keyword;

            if (btn.classList.contains('selected')) {
                // 선택 해제
                btn.classList.remove('selected');
                selectedKeywords = selectedKeywords.filter(k => k !== keyword);
            } else {
                // 선택 추가
                btn.classList.add('selected');
                selectedKeywords.push(keyword);
            }
        });
    });
}

function completeProfile() {
    dogProfileData.keywords = selectedKeywords;
    dogProfileData.id = Date.now(); // 임시 ID

    // 프로필 배열에 추가
    dogProfiles.push({...dogProfileData});

    // UI 업데이트
    renderDogProfiles();

    // 모달 닫기
    closeModal();

    alert(`${dogProfileData.name}의 프로필이 성공적으로 저장되었습니다!`);

    console.log('저장된 프로필:', dogProfileData);
}

// 컨텍스트 메뉴 관련 함수들
function showContextMenu(event, type = 'general', id = null) {
    event.preventDefault();
    event.stopPropagation();

    // 간단한 컨텍스트 메뉴 생성
    const existingMenu = document.getElementById('contextMenu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu';
    contextMenu.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        min-width: 120px;
        padding: 8px 0;
    `;

    contextMenu.innerHTML = `
        <div style="padding: 8px 16px; cursor: pointer; hover:background-color: #f5f5f5;" onclick="editItem('${type}', '${id}')">수정</div>
        <div style="padding: 8px 16px; cursor: pointer; hover:background-color: #f5f5f5;" onclick="deleteItem('${type}', '${id}')">삭제</div>
        <div style="padding: 8px 16px; cursor: pointer; hover:background-color: #f5f5f5;" onclick="shareItem('${type}', '${id}')">공유</div>
    `;

    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    document.body.appendChild(contextMenu);

    // 클릭 외부 영역에서 메뉴 닫기
    const closeMenu = (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

function showDogProfileMenu(event, profileId) {
    event.stopPropagation();
    showContextMenu(event, 'profile', profileId);
}

function editItem(type, id) {
    if (type === 'profile' && id) {
        const profile = dogProfiles.find(p => p.id == id);
        if (profile) {
            alert(`${profile.name} 프로필을 편집합니다.`);
            // 여기에 편집 로직 추가
        }
    } else {
        alert('편집 기능을 실행합니다.');
    }

    document.getElementById('contextMenu')?.remove();
}

function deleteItem(type, id) {
    if (type === 'profile' && id) {
        const profile = dogProfiles.find(p => p.id == id);
        if (profile && confirm(`${profile.name} 프로필을 삭제하시겠습니까?`)) {
            dogProfiles = dogProfiles.filter(p => p.id != id);
            renderDogProfiles();
            alert('프로필이 삭제되었습니다.');
        }
    } else {
        if (confirm('이 항목을 삭제하시겠습니까?')) {
            alert('삭제 기능을 실행합니다.');
        }
    }

    document.getElementById('contextMenu')?.remove();
}

function shareItem(type, id) {
    alert('공유 기능을 실행합니다.');
    document.getElementById('contextMenu')?.remove();
}

// 네비게이션 버튼들에 이벤트 리스너 추가
navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = e.target.getAttribute('data-tab');
        console.log(`네비게이션 클릭: ${targetTab}`);
        switchTab(targetTab);
    });
});

// 토글 버튼들에 이벤트 리스너 추가
tabToggleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetToggle = e.target.getAttribute('data-toggle');
        console.log(`토글 클릭: ${targetToggle}`);
        switchToggle(targetToggle);
    });
});

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료');

    // 기본 탭 활성화
    switchTab('profile');

    // 프로필 추가 버튼 이벤트
    const addProfileBtn = document.getElementById('addProfileBtn');
    if (addProfileBtn) {
        addProfileBtn.addEventListener('click', openProfileModal);
    }

    // 모달 관련 이벤트들
    const modal = document.getElementById('profileModal');
    if (modal) {
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // 단계별 버튼 이벤트들
        const nextStep1 = document.getElementById('nextStep1');
        const nextStep2 = document.getElementById('nextStep2');
        const prevStep2 = document.getElementById('prevStep2');
        const prevStep3 = document.getElementById('prevStep3');
        const completeBtn = document.getElementById('completeProfile');

        if (nextStep1) nextStep1.addEventListener('click', nextStep);
        if (nextStep2) nextStep2.addEventListener('click', nextStep);
        if (prevStep2) prevStep2.addEventListener('click', prevStep);
        if (prevStep3) prevStep3.addEventListener('click', prevStep);
        if (completeBtn) completeBtn.addEventListener('click', completeProfile);

        // 크기 선택 초기화
        initializeSizeSelection();

        // 키워드 선택 초기화
        initializeKeywordSelection();
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('profileModal');
            if (modal && modal.style.display === 'block') {
                closeModal();
            }
        }
    });

    // 사용자 정보 변경 버튼들
    document.querySelectorAll('.myPage_edit_btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const field = e.target.closest('.myPage_info_item').querySelector('.myPage_field').textContent;
            alert(`${field} 변경 기능을 실행합니다.`);
        });
    });

    document.querySelectorAll('.myPage_unlink_btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('연결된 서비스를 해제하시겠습니까?')) {
                alert('서비스 연결이 해제되었습니다.');
            }
        });
    });

    // 견종 검색 버튼
    const searchBtn = document.querySelector('.search_btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const breedInput = document.getElementById('dogBreed');
            const searchTerm = breedInput.value.trim();
            if (searchTerm) {
                alert(`"${searchTerm}" 견종을 검색합니다.`);
                // 여기에 실제 검색 로직 추가
            } else {
                alert('견종을 입력해주세요.');
            }
        });
    }

    console.log('이벤트 리스너 초기화 완료');
});

// 전역 함수로 노출 (HTML에서 호출 가능)
window.openProfileModal = openProfileModal;
window.closeModal = closeModal;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.completeProfile = completeProfile;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.shareItem = shareItem;
window.showDogProfileMenu = showDogProfileMenu;

console.log('JavaScript 파일 로드 완료');