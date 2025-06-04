// ✅ 승인된 내 그룹 목록 (서버에서 채움)
let myGroups = [];
let allGroups = [];

// 선택된 관심사
let selectedInterest = null;
// 중복 요청 방지 플래그
let creatingGroup = false;

// ✅ 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = document.body.getAttribute('data-authenticated') === 'true';

    // ✅ Promise.all로 fetch 모두 끝나고 나서 탭 렌더링
    Promise.all([
        fetch('/groups/api/my-groups')
            .then(response => response.json())
            .then(data => {
                console.log('✅ 내 그룹 데이터:', data);  // 응답 데이터 확인
                if (Array.isArray(data)) {
                    myGroups = data;
                    console.log('✅ 내 그룹 데이터가 배열입니다:', data);
                } else {
                    console.error('내 그룹 데이터 오류: 배열이 아닙니다', data);
                }
            })
            .catch(error => console.error('내 그룹 데이터 오류:', error)),

        fetch('/groups/api/all')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    allGroups = data;
                    console.log('✅ 전체 그룹 데이터:', data);
                } else {
                    console.error('전체 그룹 데이터 오류:', data);
                }
            }).catch(error => console.error('전체 그룹 데이터 오류:', error))
    ]).then(() => {
        // ⭐️ 모든 fetch가 끝나고 나서 로그인 여부에 따라 첫 화면 렌더링!
        if (isAuthenticated) {
            switchTab('my');
        } else {
            switchTab('all');
        }
    });

    // 검색창 이벤트
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
});

// ✅ 탭 관리
let currentTab = 'my';
function switchTab(tabType) {
    currentTab = tabType;
    document.querySelectorAll('.tab_item').forEach(tab => tab.classList.remove('active'));
    const tabElement = document.querySelector(`.tab_item[data-tab="${tabType}"]`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
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
}

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
            <div class="card_info">
                <span class="card_title">${group.gname}</span>
            </div>
        </div>
    `).join('');
}

function createGroupCard(group) {
    return `
        <div class="group_card" onclick="viewGroup('${group.gno}')">
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.gno}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.gimg ? group.gimg : '/groups/images/default.jpg'}')"></div>
            <div class="card_info">
                <span class="card_title">${group.gname}</span>
            </div>
        </div>
    `;
}

// 검색 함수
function searchGroups() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const keywordSelect = document.querySelector('.keyword_select');
    const selectedKeyword = keywordSelect ? keywordSelect.value : '';
    const groupCards = document.querySelectorAll('.group_card:not(.create_card)');

    groupCards.forEach(card => {
        const title = card.querySelector('.card_title').textContent.toLowerCase();
        let keywordMatch = true;
        let textMatch = true;

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
        }

        if (searchTerm) {
            textMatch = title.includes(searchTerm);
        }

        card.style.display = (keywordMatch && textMatch) ? 'block' : 'none';
    });
}

// 나머지 모달/이미지 업로드/그룹 생성/기타 기능은 그대로 유지 (너가 올린 버전 그대로!)



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

    if (stepNumber === 3) {
        loadMyDogs();
    }
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
    nextBtn.disabled = !(selectedInterest && selectedInterest !== '');
}

function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'gimg'; // ✅ 여기 input.name으로 수정
    input.accept = 'image/*';
    input.style.display = 'none'; // ✅ 여기도 input으로!
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
    document.body.appendChild(input); // ✅ 이 부분이 빠졌다면 추가!
    input.click();
}

// ✅ 그룹 생성
function createNewGroup(event) {
    event.preventDefault();
    if (creatingGroup) return;
    creatingGroup = true;

    const groupName = document.getElementById('groupName').value.trim();
    const groupInfo = document.getElementById('groupInfo').value.trim();
    //const selectedDogId = document.getElementById('dogId').value;

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

function loadMyDogs() {
    fetch('/groups/api/my-dogs')
        .then(response => response.json())
        .then(dogs => {
            const profileGrid = document.getElementById('profileGrid');
            profileGrid.innerHTML = '';

            dogs.forEach(dog => {
                const card = document.createElement('div');
                card.classList.add('profile_card');
                card.innerHTML = `
                    <img src="${dog.avatarUrl}" alt="${dog.dname}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%;">
                    <div>${dog.dname}</div>
                `;

                card.addEventListener('click', () => {
                    document.querySelectorAll('.profile_card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selectedDogId = dog.dno;
                    document.getElementById('completeBtn').disabled = false;
                });

                profileGrid.appendChild(card);
            });
        })
        .catch(error => console.error('내 강아지 불러오기 오류:', error));
}

// function uploadImage() {
//     const fileInput = document.getElementById('gimgInput');
//     fileInput.click();
//     fileInput.onchange = function(e) {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = function(e) {
//                 const uploadArea = document.querySelector('.upload_placeholder');
//                 uploadArea.innerHTML = `
//           <img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
//           <div style="margin-top: 8px; font-size: 12px; color: #666;">이미지가 업로드되었습니다</div>
//         `;
//             };
//             reader.readAsDataURL(file);
//         }
//     };
// }

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