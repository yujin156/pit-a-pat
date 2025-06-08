document.addEventListener('DOMContentLoaded', function() {
    // AddFamily_Modal.js가 로드될 때까지 대기
    function waitForAddFamilyModal() {
        if (typeof window.createProfileModalHTML === 'function') {
            console.log('✅ AddFamily_Modal.js 로드 완료');
            initializeLoginCenter();
        } else {
            console.log('⏳ AddFamily_Modal.js 로드 대기중...');
            setTimeout(waitForAddFamilyModal, 100);
        }
    }

    waitForAddFamilyModal();

    // 강아지 프로필도 함께 로드
    fetchAndRenderDogProfiles();
});

// ===== 전역 함수들 (스코프 문제 해결) =====

// 강아지 상태 변경 이벤트 설정 - 전역으로 이동
function setupStatusChangeEvents() {
    const statusDropdowns = document.querySelectorAll('.status_dropdown');

    statusDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function() {
            const dogId = parseInt(this.dataset.dogId);
            const newStatus = this.value;
            updateDogStatus(dogId, newStatus);
        });
    });
}

// 강아지 상태 업데이트 API 호출 - 전역으로 이동
function updateDogStatus(dogId, status) {
    fetch('/dog/update-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `dogId=${dogId}&status=${encodeURIComponent(status)}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('상태 업데이트 성공:', data);
                showStatusNotification(`상태가 "${status}"로 변경되었습니다.`, 'success');
            } else {
                console.error('상태 업데이트 실패:', data.message);
                showStatusNotification(data.message || '상태 변경에 실패했습니다.', 'error');

                // 실패 시 이전 상태로 되돌리기
                const dropdown = document.querySelector(`[data-dog-id="${dogId}"]`);
                if (dropdown) {
                    dropdown.value = '온라인';
                }
            }
        })
        .catch(error => {
            console.error('상태 업데이트 요청 실패:', error);
            showStatusNotification('네트워크 오류가 발생했습니다.', 'error');
        });
}

// 상태 변경 알림 표시 - 전역으로 이동
function showStatusNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.status-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 알림 색상 설정
    let bgColor = '#387FEB';
    if (type === 'success') bgColor = '#4CAF50';
    if (type === 'error') bgColor = '#f44336';

    // 알림 엘리먼트 생성
    const notification = document.createElement('div');
    notification.className = 'status-notification';
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 25px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out;
        max-width: 250px;
    `;

    document.body.appendChild(notification);

    // 3초 후 제거
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// ✅ 완전히 새로운 프로필 그리드 렌더링 함수 (위치 변경 없음)
function renderDogsGrid(dogs) {
    const grid = document.querySelector('.profiles_grid');
    if (!grid) return;

    grid.innerHTML = '';

    // ✅ 강아지 수에 따른 클래스 설정
    if (dogs.length === 1) {
        grid.className = 'profiles_grid single-dog';
    } else {
        grid.className = 'profiles_grid multiple-dogs';
    }

    // ✅ 항상 원래 순서대로 렌더링 (위치 변경 없음)
    dogs.forEach((dog, index) => {
        const item = document.createElement('div');
        item.className = 'profile_item';
        item.dataset.dogId = dog.dno;

        let imgDiv = '';
        if (dog.image && dog.image.diurl) {
            imgDiv = `
                <div class="profile_image">
                    <img src="${dog.image.diurl}" alt="${dog.dname} 프로필 이미지">
                </div>
            `;
        } else {
            imgDiv = `
                <div class="profile_image profile_initial">
                    <span>${dog.dname.charAt(0)}</span>
                </div>
            `;
        }

        item.innerHTML = `
            ${imgDiv}
            <div class="profile_name">${dog.dname}</div>
        `;

        grid.appendChild(item);
    });
}

// 전체 강아지 목록 가져오기 함수
function fetchAndRenderDogProfiles() {
    fetch('/api/mypage/dogs')
        .then(res => res.json())
        .then(apiDogs => {
            const dogsData = apiDogs.map(dog => ({
                dno: dog.id,
                dname: dog.name,
                image: dog.imageUrl ? { diurl: dog.imageUrl } : null,
                status: dog.status || '온라인'
            }));

            // window.dogsData에 저장(공통)
            window.dogsData = dogsData;

            // 강아지 목록 그리기
            renderDogsGrid(dogsData);

            // logincenter면 status select도 그리기
            if (document.querySelector('.pet_statuses')) {
                renderStatusSelects(dogsData);
            }
        })
        .catch(error => {
            console.error('강아지 프로필 로드 실패:', error);
        });
}

function renderStatusSelects(dogs) {
    const statuses = document.querySelector('.pet_statuses');
    if (!statuses) return;
    statuses.innerHTML = '';
    dogs.forEach(dog => {
        const sDiv = document.createElement('div');
        sDiv.className = 'pet_status';
        sDiv.innerHTML = `
            <span class="status_label">${dog.dname}</span>
            <div class="status_select">
                <select class="status_dropdown" data-dog-id="${dog.dno}">
                    <option value="온라인" ${dog.status === '온라인' ? 'selected' : ''}>온라인</option>
                    <option value="밥 먹는 중" ${dog.status === '밥 먹는 중' ? 'selected' : ''}>밥 먹는 중</option>
                    <option value="산책 중" ${dog.status === '산책 중' ? 'selected' : ''}>산책 중</option>
                    <option value="잠자는 중" ${dog.status === '잠자는 중' ? 'selected' : ''}>잠자는 중</option>
                    <option value="으르렁" ${dog.status === '으르렁' ? 'selected' : ''}>으르렁</option>
                </select>
            </div>
        `;
        statuses.appendChild(sDiv);
    });
    setupStatusChangeEvents();
}

// 메인 초기화 함수
function initializeLoginCenter() {
    console.log('Login_center.js 초기화 시작');

    // ===== 변수 선언 =====
    let favoriteFriends = [];

    // ===== 프로필 변경 리스너 설정 =====
    function setupProfileChangeListener() {
        // DogProfileManager의 이벤트 리스너
        window.addEventListener('globalProfileChanged', function(e) {
            const { dogId, dogName, dog } = e.detail;
            console.log('로그인센터: 프로필 변경 감지:', dogName || '선택 해제');

            // ✅ 프로필 변경 시 위치 변경이나 시각적 효과 제거
            // 단순히 타이틀과 친구 목록만 업데이트
            if (dogId && dog) {
                updateFavoritesTitle(dogName);
                loadFavoriteFriends();
                showStatusNotification(`${dogName}(으)로 프로필이 변경되었습니다.`, 'success');
            } else {
                // 선택 해제됨
                updateFavoritesTitle('친한');
            }
        });
    }

    // ===== 프로필 표시 업데이트 함수 제거 =====
    // updateProfileDisplay 함수 완전 제거
    // clearProfileSelection 함수 완전 제거
    // renderProfileGrid 함수 완전 제거

    // ===== 즐겨찾기 타이틀 업데이트 =====
    function updateFavoritesTitle(dogName) {
        const favoritesTitle = document.querySelector('.favorites-title');
        if (favoritesTitle) {
            if (dogName && dogName !== '친한') {
                favoritesTitle.innerHTML = `<span class="selected-dog-name">${dogName}</span>의 친한 친구`;
            } else {
                favoritesTitle.innerHTML = '친한 친구 즐겨찾기';
            }
        }
    }

    // ===== 모달 시스템 (AddFamily_Modal.js 연동) =====

    // 가족 추가 버튼 이벤트 설정
    function setupAddFamilyButton() {
        const addFamilyBtn = document.getElementById('addFamilyBtn');
        if (addFamilyBtn) {
            addFamilyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('가족 추가 버튼 클릭됨 - AddFamily_Modal.js 호출');

                // AddFamily_Modal.js의 함수 직접 호출
                if (typeof window.showAddFamilyModal === 'function') {
                    window.showAddFamilyModal();
                } else {
                    console.error('AddFamily_Modal.js가 로드되지 않았습니다');
                    alert('모달 시스템을 불러올 수 없습니다. 페이지를 새로고침해주세요.');
                }
            });
        }
    }

    // 새 프로필 추가 처리 함수
    function handleNewProfileAdded(newProfileData) {
        console.log('새 프로필 추가됨:', newProfileData);

        // 새 프로필을 dogsData에 추가
        if (window.dogsData) {
            window.dogsData.push(newProfileData);
        }

        // 프로필 그리드 업데이트
        fetchAndRenderDogProfiles();

        // 성공 알림
        showStatusNotification(`${newProfileData.dname}이(가) 가족으로 추가되었습니다!`, 'success');
    }

    // ===== 친구 관리 시스템 =====

    // 즐겨찾기 친구 목록 로드
    function loadFavoriteFriends() {
        fetch('/api/friends/favorites')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    favoriteFriends = data.friends;
                    renderFavoriteFriends();
                } else {
                    console.log('친구 목록 로드 실패:', data.message);
                    favoriteFriends = [];
                    renderFavoriteFriends();
                }
            })
            .catch(error => {
                console.error('즐겨찾기 친구 목록 로드 실패:', error);
                favoriteFriends = [];
                renderFavoriteFriends();
            });
    }

    // ✅ 즐겨찾기 친구 목록 렌더링 (친구 없을 때 항상 표시)
    function renderFavoriteFriends() {
        const friendList = document.getElementById('friendList');
        if (!friendList) return;

        friendList.innerHTML = '';

        if (favoriteFriends.length === 0) {
            friendList.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-icon">🐕</div>
                    <div class="empty-friends-text">아직 친구가 없어요!<br>매칭에서 새로운 친구를 찾아보세요</div>
                    <button onclick="window.location.href='/matching'" class="goto-friends-btn">친구 만들러 가기</button>
                </div>
            `;
            return;
        }

        favoriteFriends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.dataset.friendRequestId = friend.friendRequestId;

            // 이미지 처리: 없으면 이름 첫 글자 표시
            let avatarHtml;
            if (friend.image && friend.image.diurl) {
                avatarHtml = `<img src="${friend.image.diurl}" alt="${friend.name}" class="friend-avatar">`;
            } else {
                const firstLetter = friend.name.charAt(0);
                avatarHtml = `
                    <div class="friend-avatar" style="background-color: #387FEB; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">
                        ${firstLetter}
                    </div>
                `;
            }

            friendItem.innerHTML = `
                <div class="friend-info">
                    ${avatarHtml}
                    <span class="friend-name">${friend.name}</span>
                </div>
                <div class="friend-actions">
                    <span class="friend-status">${friend.status || '온라인'}</span>
                    <button class="btn-remove hidden" data-id="${friend.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;

            friendList.appendChild(friendItem);
        });

        // 친구 프로필 클릭 이벤트 (바로 채팅)
        document.querySelectorAll('.friend-avatar').forEach(avatar => {
            avatar.addEventListener('click', function() {
                const friendRequestId = this.closest('.friend-item').dataset.friendRequestId;
                if (friendRequestId) {
                    openChatWindow(friendRequestId);
                }
            });
        });

        // 삭제 버튼 이벤트 리스너 추가
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const friendId = parseInt(this.dataset.id);
                removeFriend(friendId);
            });
        });
    }

    // 채팅창 열기 함수
    function openChatWindow(friendRequestId) {
        const chatWindow = window.open(
            `/chat/${friendRequestId}`,
            `chat_${friendRequestId}`,
            'width=600,height=800,scrollbars=yes,resizable=yes'
        );

        if (chatWindow) {
            chatWindow.focus();
        } else {
            alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        }
    }

    // 친구 관리 버튼 이벤트 설정
    function setupFriendManagementButtons() {
        const friendsContainer = document.getElementById('friendsContainer');
        const btnEdit = document.getElementById('btnEdit');
        const btnDone = document.getElementById('btnDone');
        const btnAddFriend = document.getElementById('btnAddFriend');

        // 편집 모드 토글 함수
        function toggleEditMode() {
            if (friendsContainer) {
                friendsContainer.classList.toggle('editing');
            }
            if (btnEdit) btnEdit.classList.toggle('hidden');
            if (btnDone) btnDone.classList.toggle('hidden');
        }

        // 친구 삭제 함수
        function removeFriend(id) {
            favoriteFriends = favoriteFriends.filter(friend => friend.id !== id);
            renderFavoriteFriends();
        }

        // 친구 추가 함수 (친구 목록 페이지로 이동)
        function addFriend() {
            window.location.href = '/dog-friends/list';
        }

        // 이벤트 리스너 설정
        if (btnEdit) btnEdit.addEventListener('click', toggleEditMode);
        if (btnDone) btnDone.addEventListener('click', toggleEditMode);
        if (btnAddFriend) btnAddFriend.addEventListener('click', addFriend);
    }

    // ===== 초기화 함수들 =====

    // ✅ 페이지 로드 시 초기화 - 위치 변경 로직 제거
    function initializeProfileOrder() {
        // 단순히 기본 타이틀 설정만 수행
        updateFavoritesTitle('친한');
        console.log('로그인센터: 기본 상태로 설정 (위치 변경 없음)');
    }

    // ===== 전역 함수 노출 =====

    // 새 프로필 추가 함수를 전역으로 노출
    window.handleNewProfileAdded = handleNewProfileAdded;
    window.fetchAndRenderDogProfiles = fetchAndRenderDogProfiles;

    // ===== 초기화 실행 =====

    // 모든 이벤트 리스너 및 초기화 실행
    setupProfileChangeListener();
    setupAddFamilyButton();
    setupFriendManagementButtons();
    initializeProfileOrder();
    loadFavoriteFriends();

    console.log('Login_center.js 초기화 완료 (위치 변경 기능 제거됨)');
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);