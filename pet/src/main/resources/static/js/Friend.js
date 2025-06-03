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

        console.log('=== Friend.js 초기화 완료 ===');
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

        // 채팅 버튼 이벤트
        document.addEventListener('click', function(e) {
            if (e.target.closest('.chat_btn')) {
                const btn = e.target.closest('.chat_btn');

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


    // ===== 프로필 변경 처리 =====
    function handleProfileChange(e) {
        const selectedDogId = parseInt(e.target.value);
        console.log('프로필 변경:', selectedDogId);

        if (selectedDogId && !isLoading) {
            const selectedDog = window.friendData?.userDogs?.find(dog => dog.dno === selectedDogId);
            if (selectedDog) {
                localStorage.setItem('selectedFriendDogId', selectedDogId);
                showNotification(`${selectedDog.dname}의 친구 목록을 불러옵니다!`, 'info');

                // 페이지 새로고침으로 친구 목록 갱신
                setTimeout(() => {
                    window.location.href = `/dog-friends/list?dogId=${selectedDogId}`;
                }, 1000);
            }
        }
    }

    // ===== 초기 선택된 프로필 설정 =====


    // ===== 현재 강아지 정보 표시 =====
    function updateCurrentDogDisplay() {
        const selectedDogId = friendDogSelect?.value;
        if (selectedDogId && window.friendData?.userDogs) {
            const selectedDog = window.friendData.userDogs.find(dog => dog.dno == selectedDogId);
            if (selectedDog) {
                console.log('현재 선택된 강아지:', selectedDog.dname);

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

        updateSearchResults(visibleCount);
    }

    // ===== 검색 결과 업데이트 =====
    function updateSearchResults(visibleCount) {
        const contentContainer = document.querySelector('.friend_content');
        const noResultsMessage = document.querySelector('.no-search-results');

        if (noResultsMessage) {
            noResultsMessage.remove();
        }

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

        friendNotification.className = 'friend-notification';
        friendNotification.textContent = message;
        friendNotification.classList.add('show', type);

        setTimeout(() => {
            friendNotification.classList.remove('show');
        }, duration);

        console.log(`알림 [${type}]:`, message);
    }

    // ===== 전역 함수로 내보내기 =====
    window.friendFunctions = {
        showNotification,
        handleProfileClick,
        handleChatClick,
        updateCurrentDogDisplay
    };

    // ===== 초기화 실행 =====
    init();
});