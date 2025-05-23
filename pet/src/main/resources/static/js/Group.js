
//그룹별 정보 만들기
const myGroups = [
    {
        id: 'mygroup1',
        title: '푸들은 부들푸들',
        imageUrl: 'https://example.com/image1.jpg',
        avatarUrl: 'https://example.com/avatar1.jpg',
        keyword: 'breed'
    },
    {
        id: 'mygroup2',
        title: '우리 동네 산책 모임',
        imageUrl: 'https://example.com/image2.jpg',
        avatarUrl: 'https://example.com/avatar2.jpg',
        keyword: 'area'
    },
    {
        id: 'mygroup3',
        title: '골든 리트리버 사랑방',
        imageUrl: 'https://example.com/image3.jpg',
        avatarUrl: 'https://example.com/avatar3.jpg'
    }
];


// 현재 활성 탭
let currentTab = 'my';

// 탭 전환 함수
function switchTab(tabType) {
    currentTab = tabType;

    // 탭 버튼 활성화 상태 변경
    document.querySelectorAll('.tab_item').forEach(tab => {
        tab.classList.remove('active');
    });

    // 클릭된 탭 활성화
    event.target.classList.add('active');

    // 탭에 따른 콘텐츠 업데이트
    updateTabContent(tabType);
}

// 탭 콘텐츠 업데이트
function updateTabContent(tabType) {
    const groupsGrid = document.getElementById('groupsGrid');

    // 기존 콘텐츠 제거
    groupsGrid.innerHTML = '';

    if (tabType === 'my') {
        // 내 그룹 콘텐츠
        groupsGrid.innerHTML = getMyGroupsHTML();
    } else if (tabType === 'all') {
        // 전체 그룹 콘텐츠
        groupsGrid.innerHTML = getAllGroupsHTML();
    } else if (tabType === 'application') {
        // 가입 현황 콘텐츠
        groupsGrid.innerHTML = getApplicationStatusHTML();
    }
}

// 공통 HTML 함수
function createGroupCard(group) {
    return `
        <div class="group_card" onclick="viewGroup('${group.id}')">
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.id}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.imageUrl}')"></div>
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl}')"></div>
            </div>
            <div class="card_info">
                <span class="card_title">${group.title}</span>
            </div>
        </div>
    `;
}

// 전체 그룹 HTML 생성 (만들기 버튼 제거)
function getMyGroupsHTML() {
    let html = `
        <div class="group_card create_card" onclick="createGroup()">
            <div class="create_plus">+</div>
            <span class="create_text">만들기</span>
        </div>
    `;

    myGroups.forEach(group => {
        html += createGroupCard(group);
    });

    return html;
}
//전체 그룹데 데이터
const allGroups = [
    { id: 'group1', title: '똑고 발랄 모두를 좋아하는 강아지', imageUrl: 'images/group1.jpg', avatarUrl: 'images/avatar1.jpg' },
    { id: 'group2', title: '아기 강아지 함께 키워요', imageUrl: 'images/group2.jpg', avatarUrl: 'images/avatar2.jpg' },
    { id: 'group3', title: '대형견 산책회', imageUrl: 'images/group3.jpg', avatarUrl: 'images/avatar3.jpg' },
    { id: 'group4', title: '리트리버 모임', imageUrl: 'images/group4.jpg', avatarUrl: 'images/avatar4.jpg' },
    { id: 'group5', title: '똑고 발랄 모두를 좋아하는 강아지', imageUrl: 'images/group5.jpg', avatarUrl: 'images/avatar5.jpg' },
    { id: 'group6', title: '아기 강아지 함께 키워요', imageUrl: 'images/group6.jpg', avatarUrl: 'images/avatar6.jpg' },
    { id: 'group7', title: '대형견 산책회', imageUrl: 'images/group7.jpg', avatarUrl: 'images/avatar7.jpg' },
    { id: 'group8', title: '리트리버 모임', imageUrl: 'images/group8.jpg', avatarUrl: 'images/avatar8.jpg' },
];

//전체그룹 만드는 HTML
function getAllGroupsHTML() {
    return allGroups.map(group => `
        <div class="group_card" onclick="viewGroup('${group.id}')">
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.id}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.imageUrl}');"></div>
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl}');"></div>
            </div>
            <div class="card_info">
                <span class="card_title">${group.title}</span>
            </div>
        </div>
    `).join('');
}

//가입현황 그룹데이터
const applicationGroups = [
    { id: 'pending1', title: '푸나라 정복자', status: 'pending', imageUrl: 'images/pending1.jpg', avatarUrl: 'images/avatar9.jpg' },
    { id: 'approved1', title: '대형견 소형견 함께', status: 'approved', imageUrl: 'images/approved1.jpg', avatarUrl: 'images/avatar10.jpg' },
    { id: 'rejected1', title: '프리미엄 도그 클럽', status: 'rejected', imageUrl: 'images/rejected1.jpg', avatarUrl: 'images/avatar11.jpg' },
    { id: 'pending2', title: '우리 동네 산책 모임', status: 'pending', imageUrl: 'images/pending2.jpg', avatarUrl: 'images/avatar12.jpg' },
    { id: 'approved2', title: '반려견 훈련 스터디', status: 'approved', imageUrl: 'images/approved2.jpg', avatarUrl: 'images/avatar13.jpg' },
];


// 가입 현황 HTML 생성
function getApplicationStatusHTML() {
    return applicationGroups.map(group => `
        <div class="group_card ${group.status}" onclick="viewGroup('${group.id}')">
            <div class="status_badge ${group.status}">${group.status === 'pending' ? '가입 대기중' : group.status === 'approved' ? '가입 승인' : '가입 거절'}</div>
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.id}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.imageUrl}');"></div>
            <div class="member_profile">
                <div class="profile_avatar" style="background-image: url('${group.avatarUrl}');"></div>
            </div>
            <div class="card_info">
                <span class="card_title">${group.title}</span>
            </div>
        </div>
    `).join('');
}



// 키워드 필터링
function filterByKeyword(keyword) {
    if (currentTab !== 'all') return; // 전체 그룹에서만 필터링

    console.log('키워드별 필터:', keyword);

    const groupCards = document.querySelectorAll('.group_card:not(.create_card)');

    if (!keyword) {
        groupCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }

    groupCards.forEach(card => {
        const title = card.querySelector('.card_title').textContent.toLowerCase();
        let shouldShow = false;

        switch(keyword) {
            case 'breed':
                shouldShow = title.includes('푸들') || title.includes('리트리버') ||
                    title.includes('골든') || title.includes('종') ||
                    title.includes('품종');
                break;
            case 'area':
                shouldShow = title.includes('동네') || title.includes('산책') ||
                    title.includes('지역') || title.includes('근처');
                break;
            case 'training':
                shouldShow = title.includes('훈련') || title.includes('교육') ||
                    title.includes('스터디') || title.includes('배우') ||
                    title.includes('발랄');
                break;
        }

        card.style.display = shouldShow ? 'block' : 'none';
    });
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

        // 키워드 필터 확인 (전체 그룹에서만)
        if (selectedKeyword && currentTab === 'all') {
            switch(selectedKeyword) {
                case 'breed':
                    keywordMatch = title.includes('푸들') || title.includes('리트리버') ||
                        title.includes('골든') || title.includes('종') ||
                        title.includes('품종');
                    break;
                case 'area':
                    keywordMatch = title.includes('동네') || title.includes('산책') ||
                        title.includes('지역') || title.includes('근처');
                    break;
                case 'training':
                    keywordMatch = title.includes('훈련') || title.includes('교육') ||
                        title.includes('스터디') || title.includes('배우') ||
                        title.includes('발랄');
                    break;
            }
        }

        // 텍스트 검색 확인
        if (searchTerm) {
            textMatch = title.includes(searchTerm);
        }

        // 둘 다 만족해야 표시
        card.style.display = (keywordMatch && textMatch) ? 'block' : 'none';
    });
}

// 선택된 관심사
let selectedInterest = null;

// 그룹 관련 함수들
function createGroup() {
    console.log('새 그룹 만들기 모달 열기');
    openModal();
}

// 모달 관련 함수들
function openModal() {
    const modal = document.getElementById('createGroupModal');
    modal.classList.add('show');
    // 첫 번째 단계로 초기화
    showStep(1);
    selectedInterest = null;
    updateNextButton();
}

function closeModal() {
    const modal = document.getElementById('createGroupModal');
    modal.classList.remove('show');
    // 폼 초기화
    resetForm();
}

function showStep(stepNumber) {
    // 모든 단계 숨기기
    document.querySelectorAll('.modal_step').forEach(step => {
        step.style.display = 'none';
    });
    // 해당 단계 보이기
    document.getElementById(`step${stepNumber}`).style.display = 'block';
}

function nextStep(stepNumber) {
    showStep(stepNumber);
}

function prevStep(stepNumber) {
    showStep(stepNumber);
}

// 관심사 선택
function selectInterest(interest) {
    // 기존 선택 제거
    document.querySelectorAll('.interest_card').forEach(card => {
        card.classList.remove('selected');
    });

    // 새로운 선택 추가
    document.querySelector(`[data-interest="${interest}"]`).classList.add('selected');
    selectedInterest = interest;
    updateNextButton();
}

function updateNextButton() {
    const nextBtn = document.getElementById('nextStep1');
    if (selectedInterest) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// 이미지 업로드
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

// 새 그룹 생성
function createNewGroup() {
    const groupName = document.getElementById('groupName').value;
    const groupInfo = document.getElementById('groupInfo').value;

    if (!groupName.trim()) {
        alert('그룹 이름을 입력해주세요.');
        return;
    }

    if (!groupInfo.trim()) {
        alert('그룹 소개를 입력해주세요.');
        return;
    }

    // 새 그룹 생성 로직
    console.log('새 그룹 생성:', {
        interest: selectedInterest,
        name: groupName,
        info: groupInfo
    });

    alert(`"${groupName}" 그룹이 생성되었습니다!`);
    closeModal();

    // 내 그룹 탭으로 전환하고 새로고침
    currentTab = 'my';
    document.querySelectorAll('.tab_item').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab_item')[0].classList.add('active');
    updateTabContent('my');
}

// 폼 초기화
function resetForm() {
    selectedInterest = null;
    document.querySelectorAll('.interest_card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('groupName').value = '';
    document.getElementById('groupInfo').value = '';
    document.querySelector('.upload_placeholder').innerHTML = `
                <div class="upload_icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30.997" height="30.981" viewBox="0 0 30.997 30.981">
                      <path id="upload-image" d="M27.086,18.705a1.476,1.476,0,0,0-1.476,1.476v.561l-2.184-2.184a4.117,4.117,0,0,0-5.8,0l-1.033,1.033-3.66-3.66a4.206,4.206,0,0,0-5.8,0L4.951,18.115V9.851A1.476,1.476,0,0,1,6.427,8.376H16.756a1.476,1.476,0,1,0,0-2.951H6.427A4.427,4.427,0,0,0,2,9.851V27.559a4.427,4.427,0,0,0,4.427,4.427H24.134a4.427,4.427,0,0,0,4.427-4.427V20.181A1.476,1.476,0,0,0,27.086,18.705ZM6.427,29.035a1.476,1.476,0,0,1-1.476-1.476V22.291l4.279-4.279a1.166,1.166,0,0,1,1.608,0l4.678,4.678h0l6.345,6.345ZM25.61,27.559a1.313,1.313,0,0,1-.266.782l-6.655-6.685,1.033-1.033a1.136,1.136,0,0,1,1.623,0l4.265,4.294ZM32.56,5.852,28.133,1.426a1.526,1.526,0,0,0-2.1,0L21.611,5.852a1.482,1.482,0,0,0,2.1,2.1l1.9-1.918v8.249a1.476,1.476,0,1,0,2.951,0V6.03l1.9,1.918a1.482,1.482,0,1,0,2.1-2.1Z" transform="translate(-2 -1.005)" fill="#b7b7b7"/>
                    </svg>
                </div>
                <span class="upload_text">강아지 사진 올리기</span>
            `;
    updateNextButton();
}

function viewGroup(groupId) {
    console.log('그룹 상세 보기:', groupId);
    alert(`${groupId} 그룹 상세 페이지로 이동합니다.`);
}

function openGroupMenu(groupId) {
    console.log('그룹 메뉴:', groupId);
    alert(`${groupId} 그룹 메뉴를 열었습니다.`);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 기본적으로 내 그룹 탭 활성화
    updateTabContent('my');

    // 검색 입력 이벤트
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchGroups);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchGroups();
            }
        });
    }

    // 키워드 선택 변경 이벤트
    const keywordSelect = document.querySelector('.keyword_select');
    if (keywordSelect) {
        keywordSelect.addEventListener('change', function() {
            filterByKeyword(this.value);
        });
    }
});