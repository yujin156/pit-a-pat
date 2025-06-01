// ✅ 승인된 내 그룹 목록 (서버에서 채움)
let myGroups = [];
let allGroups = [];

// 선택된 관심사
let selectedInterest = null;
// 중복 요청 방지 플래그
let creatingGroup = false;

// ✅ 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // ✅ 로그인 여부를 Thymeleaf에서 body data-*로 받기
    const isAuthenticated = document.body.getAttribute('data-authenticated') === 'true';

    fetch('/groups/api/my-groups')
        .then(response => response.json())
        .then(data => {
            myGroups = data.map(group => ({
                id: group.gno,
                title: group.gname,
                imageUrl: `/groups/images/${group.imageUrl || 'default.jpg'}`,
                avatarUrl: `/groups/images/${group.avatarUrl || 'default_avatar.jpg'}`,
                keyword: group.gkeyword
            }));
            // ✅ 내 그룹 데이터는 받아오지만, 기본 탭은 아래 조건에서 결정!
        })
        .catch(error => console.error('내 그룹 데이터 오류:', error));

    fetch('/groups/api/all')
        .then(response => response.json())
        .then(data => {
            allGroups = data;
            console.log('✅ 전체 그룹 데이터:', allGroups);
            // ⭐️ fetch 끝나고 데이터 다 받았을 때 렌더링!
            updateTabContent('all');
        })
        .catch(error => console.error('전체 그룹 데이터 오류:', error));

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchGroups);
        searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchGroups(); });
    }

    const keywordSelect = document.querySelector('.keyword_select');
    if (keywordSelect) {
        keywordSelect.addEventListener('change', function() { filterByKeyword(this.value); });
    }

    const createGroupBtn = document.getElementById('createGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', createNewGroup);
    }

    // ✅ ⭐️ 로그인 여부에 따라 기본 탭 활성화 결정
    if (isAuthenticated) {
        updateTabContent('my');
    } else {
        updateTabContent('all');
    }
});

// ✅ 탭 관리
let currentTab = 'my';
function switchTab(tabType) {
    currentTab = tabType;
    document.querySelectorAll('.tab_item').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    updateTabContent(tabType);
}

function updateTabContent(tabType) {
    const groupsGrid = document.getElementById('groupsGrid');
    groupsGrid.innerHTML = '';

    if (tabType === 'my') {
        groupsGrid.innerHTML = getMyGroupsHTML();
    } else if (tabType === 'all') {
        groupsGrid.innerHTML = getAllGroupsHTML();
    } else if (tabType === 'application') {
        groupsGrid.innerHTML = getApplicationStatusHTML();

    }
};

function getMyGroupsHTML() {
    let html = `
        <div class="group_card create_card" onclick="createGroup()">
            <div class="create_plus">+</div>
            <span class="create_text">만들기</span>
        </div>
    `;
    myGroups.forEach(group => { html += createGroupCard(group); });
    return html;
}

function getAllGroupsHTML() {
    return allGroups.map(group => `
        <div class="group_card" onclick="viewGroup('${group.gno}')">
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.gno}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.gimg ? group.gimg : '/groups/images/default.jpg'}')"></div>
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl ? group.avatarUrl : '/groups/images/default_avatar.jpg'}')"></div>
            </div>
            <div class="card_info">
                <span class="card_title">${group.gname}</span>
            </div>
        </div>
    `).join(''); // 🔥 map() 끝나고 join('')로 문자열로 이어주기
}

// ✅ Group Card 생성 함수
function createGroupCard(group) {
    return `
        <div class="group_card" onclick="viewGroup('${group.id}')">
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.id}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.gimg ? group.gimg : '/groups/images/default.jpg'}')"></div>
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl ? group.avatarUrl : '/groups/images/default_avatar.jpg'}')"></div>
            </div>
        </div>
    `;
}

// ✅ Profile Card 생성 함수
function profileCard(profile) {
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

// ✅ 전체 그룹 카드 HTML 생성 함수
function getAllGroupsHTML() {
    return allGroups.map(group => `
        <div class="group_card" onclick="viewGroup('${group.gno}')">
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.gno}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.gimg ? group.gimg : '/groups/images/default.jpg'}')"></div>
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl ? group.avatarUrl : '/groups/images/default_avatar.jpg'}')"></div>
            </div>
            <div class="card_info">
                <span class="card_title">${group.gname}</span>
            </div>
        </div>
    `).join('');
}

// ✅ 그룹 검색 함수
function searchGroups() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const keywordSelect = document.querySelector('.keyword_select');
    const selectedKeyword = keywordSelect ? keywordSelect.value : '';
    const groupCards = document.querySelectorAll('.group_card:not(.create_card)');

    groupCards.forEach(card => {
        const title = card.querySelector('.card_title').textContent.toLowerCase();
        let keywordMatch = true;
        let textMatch = true;

        // 키워드 필터링
        if (selectedKeyword && currentTab === 'all') {
            switch (selectedKeyword) {
                case 'breed':
                    keywordMatch = title.includes('푸들') || title.includes('리트리버') ||
                        title.includes('골든') || title.includes('종') || title.includes('품종');
                    break;
                case 'area':
                    keywordMatch = title.includes('동네') || title.includes('산책') ||
                        title.includes('지역') || title.includes('근처');
                    break;
                case 'training':
                    keywordMatch = title.includes('훈련') || title.includes('교육') ||
                        title.includes('스터디') || title.includes('배우') || title.includes('발랄');
                    break;
                case 'travel':
                    keywordMatch = title.includes('여행') || title.includes('산책') ||
                        title.includes('모험') || title.includes('탐험');
                    break;
            }

            // ❌ 여기서 this.renderProfileGrid() 같은 호출은 주석처리
            // this.renderProfileGrid();
        }

        // 텍스트 검색
        if (searchTerm) {
            textMatch = title.includes(searchTerm);
        }

        // 조건 만족 여부
        card.style.display = (keywordMatch && textMatch) ? 'block' : 'none';
    });
}

function getApplicationStatusHTML() {
    return applicationGroups.map(group => `
        <div class="group_card ${group.status}" onclick="viewGroup('${group.id}')">
            <div class="status_badge ${group.status}">${group.status === 'pending' ? '가입 대기중' : group.status === 'approved' ? '가입 승인' : '가입 거절'}</div>
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.id}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.imageUrl}')"></div>
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl}')"></div>
            </div>
            <div class="card_info">
                <span class="card_title">${group.title}</span>
            </div>
        </div>
    `).join('');
}

// ✅ 그룹 생성 모달
function createGroup() { openModal(); }
function openModal() {
    const modal = document.getElementById('createGroupModal');
    modal.classList.add('show');
    showStep(1);
    selectedInterest = null;
    updateNextButton();

}
function closeModal() {
    document.getElementById('createGroupModal').classList.remove('show');
    resetForm();
}
function showStep(stepNumber) {
    document.querySelectorAll('.modal_step').forEach(step => step.style.display = 'none');
    document.getElementById(`step${stepNumber}`).style.display = 'block';
}
function nextStep(stepNumber) { showStep(stepNumber); }
function prevStep(stepNumber) { showStep(stepNumber); }

function selectInterest(interest) {
    document.querySelectorAll('.interest_card').forEach(card => card.classList.remove('selected'));
    const selectedCard = document.querySelector(`[data-interest="${interest}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedInterest = interest;
        document.getElementById('interestHiddenInput').value = interest;
    }
    updateNextButton();
}
function updateNextButton() {
    const nextBtn = document.getElementById('nextStep1');
    nextBtn.disabled = !selectedInterest;
}

function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const uploadArea = document.querySelector('.upload_placeholder');
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                    <div style="margin-top: 8px; font-size: 12px; color: #666;">이미지가 업로드되었습니다</div>
                `;
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// ✅ 그룹 생성
function createNewGroup(event) {
    event.preventDefault();
    if (creatingGroup) return;
    creatingGroup = true;

    const groupName = document.getElementById('groupName').value.trim();
    const groupInfo = document.getElementById('groupInfo').value.trim();
    const selectedDogId = document.getElementById('dogId').value;

    // ✅ 이미지 파일 input 가져오기
    const fileInput = document.querySelector('input[type="file"][name="gimg"]');

    // ✅ FormData로 모든 데이터 담기
    const formData = new FormData();
    formData.append('gname', groupName);
    formData.append('groupInfo', groupInfo);
    formData.append('dogId', selectedDogId);
    formData.append('interest', selectedInterest);
    if (fileInput && fileInput.files.length > 0) {
        formData.append('gimg', fileInput.files[0]); // ✅ 이미지 파일 추가!
    }

    fetch('/groups/api/create', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error('그룹 생성 실패!');
            return response.text();
        })
        .then(message => {
            alert(message);
            closeModal();
            creatingGroup = false;
            updateTabContent('my');
        })
        .catch(error => {
            console.error('그룹 생성 중 오류:', error);
            creatingGroup = false;
        });
}

function uploadImage() {
    const fileInput = document.getElementById('gimgInput');
    fileInput.click();
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const uploadArea = document.querySelector('.upload_placeholder');
                uploadArea.innerHTML = `
          <img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
          <div style="margin-top: 8px; font-size: 12px; color: #666;">이미지가 업로드되었습니다</div>
        `;
            };
            reader.readAsDataURL(file);
        }
    };
}

// ✅ 폼 초기화
function resetForm() {
    selectedInterest = null;
    document.querySelectorAll('.interest_card').forEach(card => card.classList.remove('selected'));
    document.getElementById('groupName').value = '';
    document.getElementById('groupInfo').value = '';
    document.querySelector('.upload_placeholder').innerHTML = `
        <div class="upload_icon">🖼️</div>
        <span class="upload_text">강아지 사진 올리기</span>
    `;
    updateNextButton();
}

function viewGroup(groupId) {
    //여기다가
    alert(`${groupId} 그룹 상세 페이지로 이동합니다.`);
    window.location.href = `/groups/${groupId}`;
}
function openGroupMenu(groupId) { alert(`${groupId} 그룹 메뉴를 열었습니다.`); }