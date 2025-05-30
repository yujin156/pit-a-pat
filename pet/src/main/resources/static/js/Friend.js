document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Friend.js 초기화 시작 ===');

    // ===== 전역 변수 =====
    let currentFriends = [];
    let isLoading = false;

    // DOM 요소들
    const friendDogSelect = document.getElementById('friendDogSelect');
    const friendLoadingSpinner = document.getElementById('friendLoadingSpinner');
    const friendNotification = document.getElementById('friendNotification');
    const breedSearch = document.querySelector('.search_type');
    const nameSearch = document.querySelector('.search_friend');

    // ===== 초기화 =====
    function init() {
        console.log('Friend.js 초기화 중...');

        // 데이터 확인
        if (window.friendData) {
            console.log('친구 데이터:', window.friendData);
            currentFriends = window.friendData.friends || [];
        } else {
            console.warn('friendData가 없습니다.');
            currentFriends = [];
        }

        setupEventListeners();
        setupProfileSelector();
        setupSearchListeners();
        initializeSelectedProfile();
        debugFriendData(); // ✅ 디버깅 함수 추가

        console.log('=== Friend.js 초기화 완료 ===');
    }

    // ✅ 친구 데이터 디버깅 함수
    function debugFriendData() {
        console.log('=== 친구 데이터 디버깅 ===');
        console.log('총 친구 수:', currentFriends.length);

        if (currentFriends.length > 0) {
            currentFriends.forEach((friend, index) => {
                console.log(`친구 ${index + 1}:`, {
                    id: friend.dno,
                    name: friend.dname,
                    hasImage: !!(friend.image && friend.image.diurl),
                    hasGender: !!(friend.ugender && friend.ugender.doglabel),
                    hasSpecies: !!(friend.species && friend.species.name),
                    addressInMap: window.friendData?.friendAddressMap?.[friend.dno],
                    requestIdInMap: window.friendData?.friendRequestIds?.[friend.dno]
                });
            });
        }

        console.log('주소 맵:', window.friendData?.friendAddressMap);
        console.log('Request ID 맵:', window.friendData?.friendRequestIds);
        console.log('=== 디버깅 완료 ===');
    }

    // ===== 이벤트 리스너 설정 =====
    function setupEventListeners() {
        // 프로필 버튼 이벤트
        document.addEventListener('click', function(e) {
            if (e.target.closest('.profile_btn')) {
                const btn = e.target.closest('.profile_btn');
                const dogId = btn.dataset.dogId;
                if (dogId) {
                    handleProfileClick(dogId);
                }
            }
        });

        // ✅ 채팅 버튼 이벤트 개선
        document.addEventListener('click', function(e) {
            if (e.target.closest('.chat_btn')) {
                const btn = e.target.closest('.chat_btn');

                // 비활성화된 버튼인지 확인
                if (btn.disabled || btn.classList.contains('disabled')) {
                    showNotification('채팅을 시작할 수 없습니다. 친구 관계가 확인되지 않았습니다.', 'error');
                    return;
                }

                const friendRequestId = btn.dataset.friendRequestId;
                console.log('채팅 버튼 클릭 - FriendRequest ID:', friendRequestId);

                if (friendRequestId && friendRequestId !== '' && friendRequestId !== 'null') {
                    handleChatClick(friendRequestId);
                } else {
                    console.error('유효하지 않은 FriendRequest ID:', friendRequestId);
                    showNotification('채팅 정보를 찾을 수 없습니다.', 'error');
                }
            }
        });

        // 친구 카드 클릭 이벤트 (프로필 보기)
        document.addEventListener('click', function(e) {
            const friendCard = e.target.closest('.friend_dog_card');
            if (friendCard && !e.target.closest('.friend_action_btn')) {
                const dogId = friendCard.dataset.dogId;
                if (dogId) {
                    handleProfileClick(dogId);
                }
            }
        });
    }

    // ===== 프로필 셀렉터 설정 =====
    function setupProfileSelector() {
        if (friendDogSelect) {
            friendDogSelect.addEventListener('change', handleProfileChange);
            console.log('프로필 셀렉터 이벤트 리스너 설정 완료');
        }
    }

    // ===== 프로필 변경 처리 =====
    function handleProfileChange(e) {
        const selectedDogId = parseInt(e.target.value);
        console.log('프로필 변경:', selectedDogId);

        if (selectedDogId && !isLoading) {
            const selectedDog = window.friendData?.userDogs?.find(dog => dog.dno === selectedDogId);
            if (selectedDog) {
                localStorage.setItem('selectedFriendDogId', selectedDogId);
                showNotification(`${selectedDog.dname}의 친구 목록을 불러옵니다!`, 'info');

                // ✅ AJAX로 친구 목록 갱신
                loadFriendsForDog(selectedDogId);
            }
        }
    }

    // ✅ AJAX로 특정 강아지의 친구 목록 로드
    function loadFriendsForDog(dogId) {
        showLoading();

        fetch(`/dog-friends/api/list?dogId=${dogId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('친구 목록 갱신 성공:', data);

                    // 데이터 업데이트
                    window.friendData.friends = data.friends;
                    window.friendData.friendAddressMap = data.friendAddressMap;
                    window.friendData.friendRequestIds = data.friendRequestIds;
                    currentFriends = data.friends;

                    // 페이지 갱신 대신 동적 업데이트
                    updateFriendsList(data);
                    showNotification(`${data.selectedDogName}의 친구 ${data.friendCount}마리를 불러왔습니다!`, 'success');
                } else {
                    console.error('친구 목록 갱신 실패:', data.message);
                    showNotification(data.message || '친구 목록을 불러오는데 실패했습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('친구 목록 갱신 오류:', error);
                showNotification('네트워크 오류가 발생했습니다.', 'error');
            })
            .finally(() => {
                hideLoading();
            });
    }

    // ✅ 친구 목록 동적 업데이트
    function updateFriendsList(data) {
        const friendContent = document.querySelector('.friend_content');
        if (!friendContent) return;

        if (!data.friends || data.friends.length === 0) {
            friendContent.innerHTML = `
                <div class="no-friends-message">
                    <div class="no-friends-icon">🐕</div>
                    <h3>아직 친구가 없어요</h3>
                    <p>매칭 페이지에서 새로운 친구를 만들어보세요!</p>
                    <button onclick="window.location.href='/matching'" class="goto-matching-btn">매칭하러 가기</button>
                </div>
            `;
            return;
        }

        const friendsHtml = data.friends.map(friend => createFriendCardHTML(friend, data)).join('');
        friendContent.innerHTML = `<div class="dog-grid-container">${friendsHtml}</div>`;

        // 서브타이틀 업데이트
        const subTitle = document.querySelector('.friend_sub_title');
        if (subTitle) {
            subTitle.textContent = `${data.selectedDogName}의 친구들 (${data.friendCount}마리)`;
        }
    }

    // ✅ 친구 카드 HTML 생성
    function createFriendCardHTML(friend, data) {
        const address = data.friendAddressMap[friend.dno] || '위치 미공개';
        const gender = friend.ugender?.doglabel || '성별 미공개';
        const species = friend.species?.name || '견종 미공개';
        const requestId = data.friendRequestIds[friend.dno];

        // 이미지 HTML 생성
        let imageHTML;
        if (friend.image && friend.image.diurl) {
            imageHTML = `
                <img class="f_dog_img" 
                     src="${friend.image.diurl}" 
                     alt="${friend.dname} 사진"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="f_dog_img default-img" style="display: none; background: linear-gradient(135deg, #387FEB, #6FA4FF); display: flex; align-items: center; justify-content: center; font-size: 60px; color: white; font-weight: bold;">
                    ${friend.dname ? friend.dname.charAt(0) : '🐕'}
                </div>
            `;
        } else {
            imageHTML = `
                <div class="f_dog_img default-img" 
                     style="background: linear-gradient(135deg, #387FEB, #6FA4FF); display: flex; align-items: center; justify-content: center; font-size: 60px; color: white; font-weight: bold;">
                    ${friend.dname ? friend.dname.charAt(0) : '🐕'}
                </div>
            `;
        }

        return `
            <div class="friend_dog_card" data-dog-id="${friend.dno}">
                <div class="f_dog_hbtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="5" height="25" viewBox="0 0 5 25">
                        <g transform="translate(-7432 -1784)">
                            <circle cx="2.5" cy="2.5" r="2.5" transform="translate(7432 1784)" fill="#b7b7b7"/>
                            <circle cx="2.5" cy="2.5" r="2.5" transform="translate(7432 1794)" fill="#b7b7b7"/>
                            <circle cx="2.5" cy="2.5" r="2.5" transform="translate(7432 1804)" fill="#b7b7b7"/>
                        </g>
                    </svg>
                </div>
                <div class="f_dog_card_cont">
                    ${imageHTML}
                    
                    <p class="f_dog_name">${friend.dname || '이름 미공개'}</p>
                    
                    <div class="dog_keyword_row">
                        <label class="dog_keyword">${address}</label>
                        <label class="dog_keyword">${gender}</label>
                        <label class="dog_keyword">${species}</label>
                    </div>
                    
                    <div class="friend_actions">
                        <button class="friend_action_btn profile_btn" data-dog-id="${friend.dno}" title="프로필 보기">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </button>
                        
                        <button class="friend_action_btn chat_btn ${!requestId ? 'disabled' : ''}" 
                                data-friend-request-id="${requestId || ''}"
                                ${!requestId ? 'disabled' : ''}
                                title="${requestId ? '채팅하기' : '채팅 불가능'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== 초기 선택된 프로필 설정 =====
    function initializeSelectedProfile() {
        if (friendDogSelect) {
            // 서버에서 전달받은 selectedDogId 우선 사용
            let savedDogId = window.friendData?.selectedDogId;

            // localStorage에서 가져오기 (백업)
            if (!savedDogId) {
                savedDogId = localStorage.getItem('selectedFriendDogId');
            }

            if (savedDogId) {
                friendDogSelect.value = savedDogId;
                console.log('저장된 프로필 복원:', savedDogId);
            }

            // 현재 선택된 강아지 정보 표시
            updateCurrentDogDisplay();
        }
    }

    // ===== 현재 강아지 정보 표시 =====
    function updateCurrentDogDisplay() {
        const selectedDogId = friendDogSelect?.value;
        if (selectedDogId && window.friendData?.userDogs) {
            const selectedDog = window.friendData.userDogs.find(dog => dog.dno == selectedDogId);
            if (selectedDog) {
                console.log('현재 선택된 강아지:', selectedDog.dname);

                // 친구 수 표시
                const friendCount = currentFriends.length;
                const subTitle = document.querySelector('.friend_sub_title');
                if (subTitle) {
                    subTitle.textContent = `${selectedDog.dname}의 친구들 (${friendCount}마리)`;
                }
            }
        }
    }

    // ===== 검색 기능 설정 =====
    function setupSearchListeners() {
        if (breedSearch) {
            breedSearch.addEventListener('input', handleSearch);
        }
        if (nameSearch) {
            nameSearch.addEventListener('input', handleSearch);
        }
    }

    // ===== 검색 처리 =====
    function handleSearch() {
        const breedValue = breedSearch?.value?.toLowerCase() || '';
        const nameValue = nameSearch?.value?.toLowerCase() || '';

        console.log('검색 중:', { breed: breedValue, name: nameValue });

        const friendCards = document.querySelectorAll('.friend_dog_card');
        let visibleCount = 0;

        friendCards.forEach(card => {
            const dogName = card.querySelector('.f_dog_name')?.textContent?.toLowerCase() || '';
            const keywords = Array.from(card.querySelectorAll('.dog_keyword'))
                .map(k => k.textContent.toLowerCase());

            const matchesBreed = breedValue === '' || keywords.some(k => k.includes(breedValue));
            const matchesName = nameValue === '' || dogName.includes(nameValue);

            if (matchesBreed && matchesName) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // 검색 결과 없음 메시지
        updateSearchResults(visibleCount);
    }

    // ===== 검색 결과 업데이트 =====
    function updateSearchResults(visibleCount) {
        const contentContainer = document.querySelector('.friend_content');
        const noResultsMessage = document.querySelector('.no-search-results');

        // 기존 메시지 제거
        if (noResultsMessage) {
            noResultsMessage.remove();
        }

        // 검색 결과가 없을 때 메시지 표시
        if (visibleCount === 0 && currentFriends.length > 0) {
            const message = document.createElement('div');
            message.className = 'no-search-results';
            message.innerHTML = `
                <div class="no-friends-icon">🔍</div>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 키워드로 검색해보세요.</p>
            `;
            message.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 80px 20px;
                color: #7f8c8d;
                min-height: 200px;
            `;
            contentContainer.appendChild(message);
        }
    }

    // ===== 프로필 클릭 처리 =====
    function handleProfileClick(dogId) {
        console.log('프로필 보기:', dogId);
        showNotification('프로필 페이지로 이동합니다!', 'info');

        setTimeout(() => {
            window.location.href = `/friend/profile/${dogId}`;
        }, 500);
    }

    // ===== 채팅 클릭 처리 =====
    function handleChatClick(friendRequestId) {
        console.log('채팅 시작:', friendRequestId);
        showNotification('채팅창을 열고 있습니다!', 'success');

        setTimeout(() => {
            // 새 창으로 채팅 열기
            const chatWindow = window.open(
                `/chat/${friendRequestId}`,
                'chatWindow',
                'width=800,height=600,scrollbars=yes,resizable=yes'
            );

            if (!chatWindow) {
                showNotification('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.', 'error');
            }
        }, 500);
    }

    // ===== 로딩 표시/숨김 =====
    function showLoading() {
        isLoading = true;
        if (friendLoadingSpinner) {
            friendLoadingSpinner.classList.remove('hidden');
        }
    }

    function hideLoading() {
        isLoading = false;
        if (friendLoadingSpinner) {
            friendLoadingSpinner.classList.add('hidden');
        }
    }

    // ===== 알림 표시 =====
    function showNotification(message, type = 'info', duration = 3000) {
        if (!friendNotification) return;

        // 기존 알림 제거
        friendNotification.className = 'friend-notification';

        // 새 알림 설정
        friendNotification.textContent = message;
        friendNotification.classList.add('show', type);

        // 자동 제거
        setTimeout(() => {
            friendNotification.classList.remove('show');
        }, duration);

        console.log(`알림 [${type}]:`, message);
    }

    // ===== 유틸리티 함수들 =====

    // 현재 선택된 강아지 ID 가져오기
    function getSelectedDogId() {
        return friendDogSelect?.value ? parseInt(friendDogSelect.value) : null;
    }

    // 특정 강아지의 친구 수 가져오기
    function getFriendCount(dogId) {
        return currentFriends.length;
    }

    // ===== 전역 함수로 내보내기 (디버깅용) =====
    window.friendFunctions = {
        showNotification,
        handleProfileClick,
        handleChatClick,
        loadFriendsForDog,
        getSelectedDogId,
        getFriendCount,
        debugFriendData
    };

    // ===== 초기화 실행 =====
    init();
});

// ===== CSS 스타일 추가 (JavaScript로 동적 추가) =====
const friendStyle = document.createElement('style');
friendStyle.textContent = `
    .no-search-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 80px 20px;
        color: #7f8c8d;
        min-height: 200px;
    }
    
    .no-search-results .no-friends-icon {
        font-size: 60px;
        margin-bottom: 15px;
        opacity: 0.5;
    }
    
    .no-search-results h3 {
        font-size: 20px;
        color: #387FEB;
        margin-bottom: 8px;
    }
    
    .no-search-results p {
        font-size: 14px;
        margin: 0;
    }

    /* 채팅 버튼 비활성화 스타일 */
    .chat_btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
    }

    /* 로딩 중 스타일 */
    .loading {
        opacity: 0.6;
        pointer-events: none;
    }
`;
document.head.appendChild(friendStyle);