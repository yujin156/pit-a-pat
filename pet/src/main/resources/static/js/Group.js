// ✅ 승인된 내 그룹 목록 (서버에서 채움)
let myGroups = [];
let allGroups = [];
let applicationGroups = [];
// 선택된 관심사

//
// const applicationGroups = [Add commentMore actions
//     {
//         id: 1,
//         status: 'pending',
//         title: '예비 사냥개들의 모임',
//         imageUrl: '/img/group1.jpg',
//         avatarUrl: '/img/dog1.jpg'
//     },
//     {
//         id: 2,
//         status: 'approved',
//         title: '반려견 훈련 클럽',
//         imageUrl: '/img/group2.jpg',
//         avatarUrl: '/img/dog2.jpg'
//     },
//     {
//         id: 3,
//         status: 'approved',
//         title: '내향적 강아지들의 모임',
//         imageUrl: '/img/Choco.jpg',
//         avatarUrl: '/img/kangKun.jpg'
//     },
//     {
//         id: 4,
//         status: 'rejected',
//         title: '산책 소리에 반응하는 모임',
//         imageUrl: '/img/group3.jpg',
//         avatarUrl: '/img/dog3.jpg'
//     }
// ];
//
 const recommendedGroups = [
     { id: 'rec1', title: '하루 산책 3시간 모임', category: '산책', imageUrl: 'https://plus.unsplash.com/premium_photo-1663133844035-aedd7ddcfca8?q=80&w=3518&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', subject: '3시간 동안 매일 산책은 힘든것 같아요'},
     { id: 'rec2', title: '물속성 강아지', category: '여행', imageUrl: 'https://images.unsplash.com/photo-1516222338250-863216ce01ea?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' , subject: '오늘도 수영장에서 안나와요'},
     { id: 'rec3', title: '함께 드라이브 합시다', category: '여행', imageUrl: 'https://images.unsplash.com/photo-1559190394-df5a28aab5c5?q=80&w=3369&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' , subject: '6시간 드라이브 :)' },
     { id: 'rec4', title: '대형견 전용 놀이터', category: '놀이', imageUrl: 'https://images.unsplash.com/photo-1494947665470-20322015e3a8?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' , subject: '뛰어노느라 집에 안가요ㅜㅜ'},
     { id: 'rec5', title: '소형견 사교 모임', category: '사교', imageUrl: 'https://images.unsplash.com/photo-1583336663277-620dc1996580?q=80&w=3538&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' , subject: '작고 소중한 악동들' },
     { id: 'rec6', title: '강아지 수영 클럽', category: '운동', imageUrl: 'https://images.unsplash.com/photo-1626529184607-29c2712ce9ad?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' , subject: '여름엔 물놀이!!'},
     { id: 'rec7', title: '간식 공유', category: '동네', imageUrl: 'https://images.unsplash.com/photo-1597806999047-9456837df754?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' ,  subject: '맛있는것에 대가가 있다'},
     { id: 'rec8', title: '강아지 훈련 워크샵', category: '훈련', imageUrl: 'https://plus.unsplash.com/premium_photo-1679521026521-e7929aae047d?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' , subject: '오늘의 힘든 훈련' }
 ];
//jpg
// // ========================================
// // 추천 그룹 관리
// // ========================================
//
 const Templates = {recommendedCard(group) {
         return `
             <div class="recommended_card" onclick="GroupManager.viewGroup('${group.id}')">
                 <div class="rec_image" style="background-image: url('${group.imageUrl}')"></div>
                 <div class="rec_info">
                     <span class="rec_category">${group.category}</span>
                     <div class="rec_title">${group.title}</div>
                     <span class="rec_subject">${group.subject}</span>
                 </div>
             </div>
         `;
     }
 };

 function renderRecommendedGroups(limit = 5) {
     const recommendedGrid = document.getElementById('recommendedGrid');
     if (!recommendedGrid) return;

     const groupsToShow = recommendedGroups.slice(0, limit);
     recommendedGrid.innerHTML = groupsToShow.map(group => Templates.recommendedCard(group)).join('');
 }

 function showAllRecommendedGroups() {
     renderRecommendedGroups(recommendedGroups.length);
     const moreLink = document.querySelector('.more_link');
     if (moreLink) moreLink.style.display = 'none';
 }
let selectedInterest = null;
// 중복 요청 방지 플래그
let creatingGroup = false;
let selectedDogId = null;
// ✅ 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = document.body.getAttribute('data-authenticated') === 'true';
//     document.getElementById('groupsGrid').innerHTML = getApplicationStatusHTML();Add commentMore actions

     renderRecommendedGroups();

    if (!isAuthenticated) {
        // 비로그인 시 탭 숨기기
        document.querySelectorAll('.tab_item[data-tab="my"], .tab_item[data-tab="application"]').forEach(tab => {
            tab.style.display = 'none';
        });

        // 전체 그룹 탭 활성화
        switchTab('all');
    }

 // ✅ 더보기 이벤트 연결
     const moreLink = document.querySelector('.more_link');
     if (moreLink) {
         moreLink.addEventListener('click', showAllRecommendedGroups);
     }
    Promise.all([
        fetch('/groups/api/my-groups')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // 상태 분리
                    myGroups = data.filter(g => g.memberStatus === 'ACCEPTED');
                    applicationGroups = data.filter(g => g.memberStatus === 'WAIT');

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
                <span class="card_content">${group.gcontent}</span>
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
                <span class="card_content">${group.gcontent}</span>
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
    if (!applicationGroups.length) {
        return `<div class="empty-message">가입 대기중인 그룹이 없습니다.</div>`;
    }
    return applicationGroups.map(group => `
        <div class="group_card pending" onclick="viewGroup('${group.gno}')">
            <div class="status_badge pending">가입 대기중</div>
            <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${group.gno}')">⋯</div>
            <div class="card_image" style="background-image: url('${group.gimg ? group.gimg : '/groups/images/default.jpg'}')"></div>
            <div class="card_info">
                <span class="card_title">${group.gname}</span>
                <span class="card_content">${group.gcontent}</span>
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
    document.querySelectorAll('.modal_step_group').forEach(step => step.style.display = 'none');
    document.getElementById(`step${stepNumber}_group`).style.display = 'block';

    if (stepNumber === 3) {
        loadMyDogs();
    }
}
function nextStep_group(stepNumber) { showStep(stepNumber); }
function prevStep_group(stepNumber) { showStep(stepNumber); }

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
    const nextBtn = document.getElementById('nextStep_group1');
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
    // const selectedDogId = document.getElementById('dogId') ? document.getElementById('dogId').value : null; // dogId 처리 확인 필요
    // selectedInterest 변수도 어딘가에서 값이 설정되어야 합니다.

    const fileInput = document.querySelector('input[type="file"][name="gimg"]');

    const formData = new FormData();
    formData.append('gname', groupName);
    formData.append('groupInfo', groupInfo);
    if (selectedDogId) { formData.append('dogId', selectedDogId); } // selectedDogId가 유효할 때만 추가
    if (selectedInterest) { formData.append('interest', selectedInterest); } // selectedInterest가 유효할 때만 추가

    if (fileInput && fileInput.files.length > 0) {
        formData.append('gimg', fileInput.files[0]);
    }

    fetch('/groups/api/create', {
        method: 'POST',
        body: formData
    })
        .then(async response => { // async 추가하여 에러 메시지 더 잘 처리
            if (!response.ok) {
                const errorText = await response.text(); // 에러 본문 읽기
                console.error('그룹 생성 실패 응답:', errorText);
                // 서버가 JSON 형태의 에러 메시지를 보낸다면 파싱 시도
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || '그룹 생성에 실패했습니다.');
                } catch (e) {
                    throw new Error(errorText || '그룹 생성에 실패했습니다.'); // 파싱 실패 시 텍스트 그대로 사용
                }
            }
            return response.text(); // 성공 시 텍스트 응답 (서버 응답 형식에 따라 .json()으로 변경 가능)
        })
        .then(message => {
            alert("그룹이 성공적으로 생성되었습니다!"); // 사용자에게 성공 알림

            closeModal(); // 모달 닫기

            fetchAndUpdateMyGroups();
            fetchAndUpdateAllGroups();

        })
        .catch(error => {
            console.error('그룹 생성 중 최종 오류:', error);
            alert(error.message || '그룹 생성 중 오류가 발생했습니다.'); // 사용자에게 오류 알림
        })
        .finally(() => { // 성공하든 실패하든 항상 실행
            creatingGroup = false; // 중복 요청 방지 플래그 해제
        });
}
function loadMyDogs() {
    fetch('/groups/api/my-dogs')
        .then(response => response.json())
        .then(dogs => {
            const profileGrid = document.getElementById('profileGrid');
            profileGrid.innerHTML = '';

            if (!dogs || dogs.length === 0) {
                profileGrid.innerHTML = '<p>등록된 강아지 정보가 없습니다.</p>';
                selectedDogId = null;
                if (document.getElementById('completeBtn')) {
                    document.getElementById('completeBtn').disabled = true;
                }
                return;
            }

            // 대표 강아지(isMain)가 있다면 자동 선택, 없으면 첫 강아지 선택
            let mainDogDno = null;
            if (dogs.some(d => d.isMain)) {
                mainDogDno = dogs.find(d => d.isMain).dno;
            }

            dogs.forEach(dog => {
                const avatarUrl = dog.avatarUrl || '/images/default_dog_profile.png';
                const isMainDog = mainDogDno ? dog.dno === mainDogDno : false;

                const card = document.createElement('div');
                card.className = 'profile_card' + (isMainDog ? ' selected' : '');
                card.setAttribute('data-profile-id', dog.dno);
                card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url('${avatarUrl}')`;

                card.innerHTML = `
                    <div class="profile_info_overlay">
                        <div class="profile_name_modal">${dog.dname}</div>
                        <div class="profile_details">
                            <span class="profile_detail_item">${dog.speciesName || ''}</span>
                            <span class="profile_detail_item">${dog.size || ''}</span>
                            <span class="profile_detail_item">${dog.gender || ''}</span>
                        </div>
                    </div>
                `;

                card.addEventListener('click', function () {
                    document.querySelectorAll('.profile_card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedDogId = dog.dno;
                    const completeBtn = document.getElementById('completeBtn');
                    if (completeBtn) completeBtn.disabled = false;
                });

                profileGrid.appendChild(card);

                // 최초 로딩 시 대표 강아지 자동 선택
                if (isMainDog) {
                    selectedDogId = dog.dno;
                    const completeBtn = document.getElementById('completeBtn');
                    if (completeBtn) completeBtn.disabled = false;
                }
            });

            // 대표 강아지가 없으면 첫 번째 강아지 자동 선택
            if (!selectedDogId && dogs.length > 0) {
                profileGrid.firstChild.classList.add('selected');
                selectedDogId = dogs[0].dno;
                const completeBtn = document.getElementById('completeBtn');
                if (completeBtn) completeBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('내 강아지 불러오기 오류:', error);
            const profileGrid = document.getElementById('profileGrid');
            if (profileGrid) {
                profileGrid.innerHTML = '<p>강아지 정보를 불러오는 중 오류가 발생했습니다.</p>';
            }
            selectedDogId = null;
            const completeBtn = document.getElementById('completeBtn');
            if (completeBtn) completeBtn.disabled = true;
        });
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
async function fetchAndUpdateMyGroups() {
    try {
        const response = await fetch('/groups/api/my-groups');
        if (!response.ok) {
            console.error('내 그룹 목록 다시 불러오기 실패:', await response.text());
            return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            // 상태 분리 (여기도 memberStatus로!)
            myGroups = data.filter(g => g.memberStatus === 'ACCEPTED');
            applicationGroups = data.filter(g => g.memberStatus === 'WAIT');
            if (currentTab === 'my') {
                updateTabContent('my');
            }
            if (currentTab === 'application') {
                updateTabContent('application');
            }
        } else {
            console.error('내 그룹 목록 업데이트 실패: 서버 응답이 배열이 아님', data);
        }
    } catch (error) {
        console.error('내 그룹 목록 다시 불러오는 중 오류:', error);
    }
}

async function fetchAndUpdateAllGroups() {
    try {
        const response = await fetch('/groups/api/all');
        if (!response.ok) {
            console.error('전체 그룹 목록 다시 불러오기 실패:', await response.text());
            return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            allGroups = data;

            if (currentTab === 'all') {
                updateTabContent('all');
            }
        } else {
            console.error('전체 그룹 목록 업데이트 실패: 서버 응답이 배열이 아님', data);
        }
    } catch (error) {
        console.error('전체 그룹 목록 다시 불러오는 중 오류:', error);
    }
}