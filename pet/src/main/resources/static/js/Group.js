// ========================================
// 데이터 모델
// ========================================

const DATA = {
    myGroups: [
        {
            id: 'mygroup1',
            title: '푸들은 부들푸들',
            imageUrl: 'https://via.placeholder.com/280x200/87CEEB/000000?text=Poodle+Group',
            avatarUrl: 'https://via.placeholder.com/32x32/FFB6C1/000000?text=U1',
            keyword: 'breed'
        },
        {
            id: 'mygroup2',
            title: '우리 동네 산책 모임',
            imageUrl: 'https://via.placeholder.com/280x200/98FB98/000000?text=Walk+Group',
            avatarUrl: 'https://via.placeholder.com/32x32/DDA0DD/000000?text=U2',
            keyword: 'area'
        },
        {
            id: 'mygroup3',
            title: '골든 리트리버 사랑방',
            imageUrl: 'https://via.placeholder.com/280x200/F0E68C/000000?text=Golden+Group',
            avatarUrl: 'https://via.placeholder.com/32x32/FFA07A/000000?text=U3'
        }
    ],

    allGroups: [
        { id: 'group1', title: '똑고 발랄 모두를 좋아하는 강아지', imageUrl: 'https://via.placeholder.com/280x200/FFE4E1/000000?text=Happy+Dogs', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A1' },
        { id: 'group2', title: '아기 강아지 함께 키워요', imageUrl: 'https://via.placeholder.com/280x200/F5F5DC/000000?text=Puppy+Care', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A2' },
        { id: 'group3', title: '대형견 산책회', imageUrl: 'https://via.placeholder.com/280x200/E6E6FA/000000?text=Big+Dog+Walk', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A3' },
        { id: 'group4', title: '리트리버 모임', imageUrl: 'https://via.placeholder.com/280x200/FFEFD5/000000?text=Retriever+Club', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A4' },
        { id: 'group5', title: '똥꼬 발랄 모두를 좋아하는 강아지', imageUrl: 'https://via.placeholder.com/280x200/F0FFF0/000000?text=Active+Dogs', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A5' },
        { id: 'group6', title: '아기 강아지 함께 키워요', imageUrl: 'https://via.placeholder.com/280x200/FFF8DC/000000?text=Puppy+Group', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A6' },
        { id: 'group7', title: '대형견 산책회', imageUrl: 'https://via.placeholder.com/280x200/F5FFFA/000000?text=Large+Dogs', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A7' },
        { id: 'group8', title: '리트리버 모임', imageUrl: 'https://via.placeholder.com/280x200/FDF5E6/000000?text=Retriever+Meet', avatarUrl: 'https://via.placeholder.com/32x32/E0E0E0/000000?text=A8' }
    ],

    applicationGroups: [
        { id: 'pending1', title: '푸나라 정복자', status: 'pending', imageUrl: 'https://via.placeholder.com/280x200/FFF3CD/000000?text=Pending+1', avatarUrl: 'https://via.placeholder.com/32x32/F8D7DA/000000?text=P1' },
        { id: 'approved1', title: '대형견 소형견 함께', status: 'approved', imageUrl: 'https://via.placeholder.com/280x200/D4EDDA/000000?text=Approved+1', avatarUrl: 'https://via.placeholder.com/32x32/D1ECF1/000000?text=A1' },
        { id: 'rejected1', title: '프리미엄 도그 클럽', status: 'rejected', imageUrl: 'https://via.placeholder.com/280x200/F8D7DA/000000?text=Rejected+1', avatarUrl: 'https://via.placeholder.com/32x32/F5C6CB/000000?text=R1' },
        { id: 'pending2', title: '우리 동네 산책 모임', status: 'pending', imageUrl: 'https://via.placeholder.com/280x200/FFF3CD/000000?text=Pending+2', avatarUrl: 'https://via.placeholder.com/32x32/F8D7DA/000000?text=P2' },
        { id: 'approved2', title: '반려견 훈련 스터디', status: 'approved', imageUrl: 'https://via.placeholder.com/280x200/D4EDDA/000000?text=Approved+2', avatarUrl: 'https://via.placeholder.com/32x32/D1ECF1/000000?text=A2' }
    ],

    recommendedGroups: [
        { id: 'rec1', title: '하루 산책 3시간 모임', category: '산책', imageUrl: 'https://via.placeholder.com/300x200/87CEEB/000000?text=3h+Walk' },
        { id: 'rec2', title: '물속성 강아지', category: '산책', imageUrl: 'https://via.placeholder.com/300x200/40E0D0/000000?text=Water+Dog' },
        { id: 'rec3', title: '장난감 뽀서', category: '산책', imageUrl: 'https://via.placeholder.com/300x200/FFB6C1/000000?text=Toy+Lover' },
        { id: 'rec4', title: '대형견 전용 놀이터', category: '놀이', imageUrl: 'https://via.placeholder.com/300x200/98FB98/000000?text=Big+Dog+Play' },
        { id: 'rec5', title: '소형견 사교 모임', category: '사교', imageUrl: 'https://via.placeholder.com/300x200/DDA0DD/000000?text=Small+Dog+Social' },
        { id: 'rec6', title: '강아지 수영 클럽', category: '운동', imageUrl: 'https://via.placeholder.com/300x200/20B2AA/000000?text=Dog+Swimming' },
        { id: 'rec7', title: '펫 카페 투어', category: '여행', imageUrl: 'https://via.placeholder.com/300x200/F4A460/000000?text=Pet+Cafe+Tour' },
        { id: 'rec8', title: '강아지 훈련 워크샵', category: '훈련', imageUrl: 'https://via.placeholder.com/300x200/9370DB/000000?text=Training+Workshop' }
    ],

    userProfiles: [
        {
            id: 'profile1',
            petName: '초코',
            breed: '푸들',
            size: '소형견',
            gender: '수컷',
            avatarUrl: 'https://images.unsplash.com/photo-1616190264687-b7ebf7aa9afe?w=400&h=300&fit=crop&crop=faces',
            isMain: true
        },
        {
            id: 'profile2',
            petName: '강군',
            breed: '푸들',
            size: '소형견',
            gender: '수컷',
            avatarUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop&crop=faces',
            isMain: false
        }
    ]
};

// ========================================
// 상태 관리
// ========================================

const STATE = {
    currentTab: 'my',
    selectedInterest: null,
    selectedProfileId: null
};

// ========================================
// 유틸리티 함수
// ========================================

const Utils = {
    // 상태 변경 메시지
    getStatusText(status) {
        const statusMap = {
            pending: '가입 대기중',
            approved: '가입 승인',
            rejected: '가입 거절'
        };
        return statusMap[status] || status;
    },

    // 키워드별 검색 조건
    matchesKeyword(title, keyword) {
        const titleLower = title.toLowerCase();
        const keywordMatchers = {
            breed: () => ['푸들', '리트리버', '골든', '종', '품종'].some(term => titleLower.includes(term)),
            area: () => ['동네', '산책', '지역', '근처'].some(term => titleLower.includes(term)),
            training: () => ['훈련', '교육', '스터디', '배우', '발랄'].some(term => titleLower.includes(term)),
            travel: () => ['여행', '투어', '캠핑', '나들이'].some(term => titleLower.includes(term))
        };
        return keywordMatchers[keyword]?.() || false;
    },

    // DOM 요소 선택
    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    }
};

// ========================================
// HTML 템플릿 생성기
// ========================================

const Templates = {
    groupCard(group, showMenu = true, showProfile = true) {
        return `
        <div class="group_card" onclick="GroupManager.viewGroup('${group.id}')">
            ${showMenu ? `<div class="card_menu" onclick="event.stopPropagation(); GroupManager.openGroupMenu('${group.id}')">⋯</div>` : ''}
            <div class="card_image" style="background-image: url('${group.imageUrl}')"></div>
            ${showProfile ? `
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl}')"></div>
            </div>
            ` : ''}
            <div class="card_info">
                <span class="card_title">${group.title}</span>
            </div>
        </div>
    `;
    },


    createCard() {
        return `
            <div class="group_card create_card" onclick="ModalManager.openModal()">
                <div class="create_plus">+</div>
                <span class="create_text">만들기</span>
            </div>
        `;
    },

    applicationCard(group) {
        return `
            <div class="group_card ${group.status}" onclick="GroupManager.viewGroup('${group.id}')">
                <div class="status_badge ${group.status}">${Utils.getStatusText(group.status)}</div>
                <div class="card_menu" onclick="event.stopPropagation(); GroupManager.openGroupMenu('${group.id}')">⋯</div>
                <div class="card_image" style="background-image: url('${group.imageUrl}')"></div>
                <div class="member_profile">
                    <div class="profile_avatar" style="background-image: url('${group.avatarUrl}')"></div>
                </div>
                <div class="card_info">
                    <span class="card_title">${group.title}</span>
                </div>
            </div>
        `;
    },

    recommendedCard(group) {
        return `
            <div class="recommended_card" onclick="GroupManager.viewGroup('${group.id}')">
                <div class="rec_image" style="background-image: url('${group.imageUrl}')"></div>
                <div class="rec_info">
                    <span class="rec_category">${group.category}</span>
                    <div class="rec_title">${group.title}</div>
                </div>
            </div>
        `;
    },

    profileCard(profile) {
        return `
            <div class="profile_card ${profile.isMain ? 'selected' : ''}" 
                 data-profile-id="${profile.id}" 
                 onclick="ModalManager.selectProfile('${profile.id}')"
                 style="background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url('${profile.avatarUrl}');">
                
                ${!profile.isMain ? `<div class="profile_card_menu" onclick="event.stopPropagation(); ModalManager.openProfileMenu('${profile.id}')"></div>` : ''}
                
                <div class="profile_info_overlay">
                    <div class="profile_name">${profile.petName}</div>
                    <div class="profile_details">
                        <span class="profile_detail_item">${profile.breed}</span>
                        <span class="profile_detail_item">${profile.size}</span>
                        <span class="profile_detail_item">${profile.gender}</span>
                    </div>
                </div>
            </div>
        `;
    }
};

// ========================================
// 탭 관리
// ========================================

const TabManager = {
    switch(tabType, element) {
        console.log('탭 전환:', tabType);
        STATE.currentTab = tabType;

        // 탭 버튼 활성화 상태 변경
        Utils.$$('.tab_item').forEach(tab => tab.classList.remove('active'));
        element.classList.add('active');

        // 탭 콘텐츠 업데이트
        this.updateContent(tabType);
    },

    updateContent(tabType) {
        const groupsGrid = Utils.$('#groupsGrid');
        if (!groupsGrid) return;

        const contentGenerators = {
            // 내 그룹: 메뉴와 프로필 모두 표시
            my: () => Templates.createCard() + DATA.myGroups.map(group => Templates.groupCard(group, true, true)).join(''),

            // 전체 그룹: 메뉴와 프로필 모두 숨김
            all: () => DATA.allGroups.map(group => Templates.groupCard(group, false, false)).join(''),

            // 신청 그룹: 기존과 동일
            application: () => DATA.applicationGroups.map(group => Templates.applicationCard(group)).join('')
        };

        groupsGrid.innerHTML = contentGenerators[tabType]?.() || '';
    }
};

// ========================================
// 검색 및 필터링
// ========================================

const SearchManager = {
    searchGroups() {
        const searchTerm = Utils.$('#searchInput')?.value.toLowerCase() || '';
        const selectedKeyword = Utils.$('.keyword_select')?.value || '';
        const groupCards = Utils.$$('.group_card:not(.create_card)');

        console.log('검색어:', searchTerm);

        groupCards.forEach(card => {
            const title = card.querySelector('.card_title')?.textContent.toLowerCase() || '';

            const keywordMatch = !selectedKeyword ||
                (STATE.currentTab === 'all' && Utils.matchesKeyword(title, selectedKeyword));
            const textMatch = !searchTerm || title.includes(searchTerm);

            card.style.display = (keywordMatch && textMatch) ? 'block' : 'none';
        });
    },

    filterByKeyword(keyword) {
        if (STATE.currentTab !== 'all') return;

        console.log('키워드별 필터:', keyword);
        const groupCards = Utils.$$('.group_card:not(.create_card)');

        groupCards.forEach(card => {
            const title = card.querySelector('.card_title')?.textContent || '';
            const shouldShow = !keyword || Utils.matchesKeyword(title, keyword);
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }
};

// ========================================
// 그룹 관리
// ========================================

const GroupManager = {
    viewGroup(groupId) {
        console.log('그룹 상세 보기:', groupId);
        alert(`${groupId} 그룹 상세 페이지로 이동합니다.`);
    },

    openGroupMenu(groupId) {
        console.log('그룹 메뉴:', groupId);
        alert(`${groupId} 그룹 메뉴를 열었습니다.`);
    },

    create(formData) {
        const selectedProfile = DATA.userProfiles.find(p => p.id === STATE.selectedProfileId);

        const newGroup = {
            id: `mygroup${DATA.myGroups.length + 1}`,
            title: formData.name,
            imageUrl: 'https://via.placeholder.com/280x200/90EE90/000000?text=New+Group',
            avatarUrl: selectedProfile?.avatarUrl || 'https://via.placeholder.com/32x32/FFA500/000000?text=NEW',
            keyword: STATE.selectedInterest,
            mainProfile: selectedProfile
        };

        DATA.myGroups.push(newGroup);
        console.log('새 그룹 생성:', newGroup);

        alert(`"${formData.name}" 그룹이 생성되었습니다!\n메인 프로필: ${selectedProfile?.petName || '알 수 없음'}`);

        // 내 그룹 탭으로 전환
        STATE.currentTab = 'my';
        Utils.$$('.tab_item').forEach(tab => tab.classList.remove('active'));
        Utils.$$('.tab_item')[0]?.classList.add('active');
        TabManager.updateContent('my');
    }
};

// ========================================
// 추천 그룹 관리
// ========================================

const RecommendedManager = {
    render(limit = 5) {
        const recommendedGrid = Utils.$('#recommendedGrid');
        if (!recommendedGrid) {
            console.error('recommendedGrid 요소를 찾을 수 없습니다.');
            return;
        }

        const groupsToShow = DATA.recommendedGroups.slice(0, limit);
        recommendedGrid.innerHTML = groupsToShow.map(group => Templates.recommendedCard(group)).join('');
        console.log('추천 그룹이 렌더링되었습니다.');
    },

    showMore() {
        this.render(DATA.recommendedGroups.length);
        Utils.$('.more_link')?.remove();
        console.log('모든 추천 그룹을 표시합니다.');
    }
};

// ========================================
// 모달 관리
// ========================================

const ModalManager = {
    openModal() {
        const modal = Utils.$('#createGroupModal');
        modal?.classList.add('show');
        this.showStep(1);
        this.resetState();
        console.log('모달이 열렸습니다.');
    },

    closeModal() {
        const modal = Utils.$('#createGroupModal');
        modal?.classList.remove('show');
        this.resetForm();
        console.log('모달이 닫혔습니다.');
    },

    showStep(stepNumber) {
        Utils.$$('.modal_step').forEach(step => step.style.display = 'none');
        const targetStep = Utils.$(`#step${stepNumber}`);
        if (targetStep) {
            targetStep.style.display = 'block';
        }
        console.log('스텝 변경:', stepNumber);
    },

    nextStep(stepNumber) {
        if (stepNumber === 3) {
            const groupName = Utils.$('#groupName')?.value.trim();
            if (!groupName) {
                alert('그룹 이름을 입력해주세요.');
                return;
            }
            this.renderProfileGrid();
        }
        this.showStep(stepNumber);
    },

    prevStep(stepNumber) {
        this.showStep(stepNumber);
    },

    selectInterest(interest) {
        Utils.$$('.interest_card').forEach(card => card.classList.remove('selected'));
        Utils.$(`[data-interest="${interest}"]`)?.classList.add('selected');
        STATE.selectedInterest = interest;
        this.updateNextButton();
        console.log('관심사 선택:', interest);
    },

    selectProfile(profileId) {
        Utils.$$('.profile_card').forEach(card => card.classList.remove('selected'));
        Utils.$(`[data-profile-id="${profileId}"]`)?.classList.add('selected');
        STATE.selectedProfileId = profileId;
        this.updateCompleteButton();
        console.log('프로필 선택:', profileId);
    },

    renderProfileGrid() {
        const profileGrid = Utils.$('#profileGrid');
        if (!profileGrid) return;

        profileGrid.innerHTML = DATA.userProfiles.map(profile => Templates.profileCard(profile)).join('');

        // 메인 프로필 자동 선택
        const mainProfile = DATA.userProfiles.find(p => p.isMain);
        if (mainProfile) {
            STATE.selectedProfileId = mainProfile.id;
            this.updateCompleteButton();
        }

        console.log('프로필 그리드가 렌더링되었습니다.');
    },

    updateNextButton() {
        const nextBtn = Utils.$('#nextStep1');
        if (nextBtn) {
            nextBtn.disabled = !STATE.selectedInterest;
        }
    },

    updateCompleteButton() {
        const completeBtn = Utils.$('#completeBtn');
        if (completeBtn) {
            completeBtn.disabled = !STATE.selectedProfileId;
        }
    },

    createGroup() {
        const groupName = Utils.$('#groupName')?.value.trim();
        const groupInfo = Utils.$('#groupInfo')?.value.trim();

        if (!groupName) {
            alert('그룹 이름을 입력해주세요.');
            return;
        }

        if (!groupInfo) {
            alert('그룹 소개를 입력해주세요.');
            return;
        }

        if (!STATE.selectedProfileId) {
            alert('메인 프로필을 선택해주세요.');
            return;
        }

        GroupManager.create({ name: groupName, info: groupInfo });
        this.closeModal();
    },

    uploadImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const uploadArea = Utils.$('.upload_placeholder');
                    if (uploadArea) {
                        uploadArea.innerHTML = `
                            <img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                            <div style="margin-top: 8px; font-size: 12px; color: #666;">이미지가 업로드되었습니다</div>
                        `;
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
        console.log('이미지 업로드 창 열기');
    },

    openProfileMenu(profileId) {
        console.log('프로필 메뉴:', profileId);
        alert(`${profileId} 프로필 메뉴를 열었습니다.`);
    },

    resetState() {
        STATE.selectedInterest = null;
        STATE.selectedProfileId = null;
        this.updateNextButton();
        this.updateCompleteButton();
    },

    resetForm() {
        this.resetState();

        Utils.$$('.interest_card').forEach(card => card.classList.remove('selected'));

        const groupNameInput = Utils.$('#groupName');
        const groupInfoInput = Utils.$('#groupInfo');

        if (groupNameInput) groupNameInput.value = '';
        if (groupInfoInput) groupInfoInput.value = '';

        const uploadArea = Utils.$('.upload_placeholder');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload_icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30.997" height="30.981" viewBox="0 0 30.997 30.981">
                      <path d="M27.086,18.705a1.476,1.476,0,0,0-1.476,1.476v.561l-2.184-2.184a4.117,4.117,0,0,0-5.8,0l-1.033,1.033-3.66-3.66a4.206,4.206,0,0,0-5.8,0L4.951,18.115V9.851A1.476,1.476,0,0,1,6.427,8.376H16.756a1.476,1.476,0,1,0,0-2.951H6.427A4.427,4.427,0,0,0,2,9.851V27.559a4.427,4.427,0,0,0,4.427,4.427H24.134a4.427,4.427,0,0,0,4.427-4.427V20.181A1.476,1.476,0,0,0,27.086,18.705Z" transform="translate(-2 -1.005)" fill="#b7b7b7"/>
                    </svg>
                </div>
                <span class="upload_text">강아지 사진 올리기</span>
            `;
        }

        console.log('폼이 초기화되었습니다.');
    }
};

// ========================================
// 전역 함수 (HTML에서 호출용)
// ========================================

// 탭 전환
function switchTab(tabType) {
    TabManager.switch(tabType, event.target);
}

// 검색
function searchGroups() {
    SearchManager.searchGroups();
}

// 필터링
function filterByKeyword(keyword) {
    SearchManager.filterByKeyword(keyword);
}

// 그룹 관련
function viewGroup(groupId) {
    GroupManager.viewGroup(groupId);
}

function openGroupMenu(groupId) {
    GroupManager.openGroupMenu(groupId);
}

// 모달 관련
function openModal() {
    ModalManager.openModal();
}

function closeModal() {
    ModalManager.closeModal();
}

function showStep(stepNumber) {
    ModalManager.showStep(stepNumber);
}

function nextStep(stepNumber) {
    ModalManager.nextStep(stepNumber);
}

function prevStep(stepNumber) {
    ModalManager.prevStep(stepNumber);
}

function selectInterest(interest) {
    ModalManager.selectInterest(interest);
}

function selectProfile(profileId) {
    ModalManager.selectProfile(profileId);
}

function createNewGroup() {
    ModalManager.createGroup();
}

function uploadImage() {
    ModalManager.uploadImage();
}

function openProfileMenu(profileId) {
    ModalManager.openProfileMenu(profileId);
}

function showMoreRecommended() {
    RecommendedManager.showMore();
}

// ========================================
// 초기화
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료 - 페이지 초기화 시작');

    // 기본 탭 설정
    TabManager.updateContent('my');

    // 추천 그룹 초기화
    RecommendedManager.render();

    // 이벤트 리스너 등록
    const searchInput = Utils.$('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', SearchManager.searchGroups);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') SearchManager.searchGroups();
        });
        console.log('검색 이벤트 리스너 등록 완료');
    }

    const keywordSelect = Utils.$('.keyword_select');
    if (keywordSelect) {
        keywordSelect.addEventListener('change', function() {
            SearchManager.filterByKeyword(this.value);
        });
        console.log('키워드 선택 이벤트 리스너 등록 완료');
    }

    const moreLink = Utils.$('.more_link');
    if (moreLink) {
        moreLink.addEventListener('click', function(e) {
            e.preventDefault();
            RecommendedManager.showMore();
        });
        console.log('더보기 링크 이벤트 리스너 등록 완료');
    }

    console.log('Group.js 파일이 성공적으로 로드되었습니다!');
    console.log('페이지 초기화 완료!');
});