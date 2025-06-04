document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Friend.js 초기화 시작 ===');

    let currentFriends = [];
    let isLoading = false;

    const friendDogSelect = document.getElementById('friendDogSelect');
    const friendLoadingSpinner = document.getElementById('friendLoadingSpinner');
    const friendNotification = document.getElementById('friendNotification');
    const breedSearch = document.querySelector('.search_type');
    const nameSearch = document.querySelector('.search_friend');

    init();

    function init() {
        console.log('Friend.js 초기화 중...');

        setupEventListeners();
        setupSearchListeners();
        setupProfileChangeListener();
        setupDropdownListener(); // ✅ 드롭다운 직접 리스너 추가

        // ✅ 초기 상태 확인 및 설정
        if (window.dogProfileManager?.hasSelection()) {
            const selectedId = window.dogProfileManager.getSelectedDogId();
            console.log('기존 선택된 강아지 ID:', selectedId);

            // 드롭다운 값 동기화
            if (friendDogSelect && selectedId) {
                friendDogSelect.value = selectedId;
            }

            loadFriendsForDog(selectedId);
        } else {
            // ✅ 선택된 강아지가 없으면 가이드 표시
            showProfileSelectionGuide();
            // 드롭다운 초기화
            if (friendDogSelect) {
                friendDogSelect.value = '';
            }
        }

        console.log('=== Friend.js 초기화 완료 ===');
    }

    // ✅ 드롭다운 직접 리스너 추가
    function setupDropdownListener() {
        if (friendDogSelect) {
            friendDogSelect.addEventListener('change', function(e) {
                const selectedDogId = e.target.value;
                console.log('드롭다운에서 강아지 선택:', selectedDogId);

                if (selectedDogId) {
                    // DogProfileManager에 선택 알림
                    if (window.dogProfileManager) {
                        window.dogProfileManager.selectDog(parseInt(selectedDogId));
                    }
                    loadFriendsForDog(parseInt(selectedDogId));
                } else {
                    // 선택 해제
                    if (window.dogProfileManager) {
                        window.dogProfileManager.clearSelection();
                    }
                    showProfileSelectionGuide();
                }
            });
        }
    }

    function setupProfileChangeListener() {
        window.addEventListener('globalProfileChanged', function (e) {
            const { dogId, dogName } = e.detail;
            console.log('🐶 프로필 변경 감지:', dogName || '선택 해제');

            // ✅ 드롭다운 값 동기화
            if (friendDogSelect) {
                friendDogSelect.value = dogId || '';
            }

            if (dogId) {
                showNotification(`${dogName}의 친구 목록을 불러옵니다!`, 'info');
                removeGuide();
                loadFriendsForDog(dogId);
            } else {
                showProfileSelectionGuide();
                clearFriendsList();
            }
        });
    }

    function showProfileSelectionGuide() {
        const container = document.querySelector('.friend_content');
        if (!container) return;

        container.innerHTML = `
            <div class="profile-selection-guide">
                <div class="guide-icon">🐕</div>
                <h3>어떤 강아지의 친구를 볼까요?</h3>
                <p>위의 드롭다운에서 강아지를 선택하면<br>그 강아지의 친구 목록을 볼 수 있어요!</p>
                <button onclick="focusFriendDropdown()" class="guide-btn">강아지 선택하기</button>
            </div>`;

        // ✅ 가이드 스타일 적용
        const guideElement = container.querySelector('.profile-selection-guide');
        if (guideElement) {
            guideElement.style.cssText = `
                display: flex; flex-direction: column; align-items: center;
                justify-content: center; text-align: center; padding: 80px 20px;
                color: #7f8c8d; min-height: 400px;
            `;

            const guideIcon = guideElement.querySelector('.guide-icon');
            if (guideIcon) {
                guideIcon.style.cssText = 'font-size: 80px; margin-bottom: 20px; opacity: 0.5;';
            }

            const guideBtn = guideElement.querySelector('.guide-btn');
            if (guideBtn) {
                guideBtn.style.cssText = `
                    padding: 12px 30px; background: #387FEB; color: white; border: none;
                    border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer;
                    transition: all 0.3s ease;
                `;
            }
        }
    }

    // ✅ 친구 목록 초기화 함수 추가
    function clearFriendsList() {
        currentFriends = [];
        const container = document.querySelector('.friend_content');
        if (container) {
            container.innerHTML = '';
        }
        updateCurrentDogDisplay('');
    }

    window.focusFriendDropdown = function () {
        if (friendDogSelect) {
            friendDogSelect.focus();
            friendDogSelect.click();
        }
    };

    function loadFriendsForDog(dogId) {
        if (!dogId || isLoading) return;

        console.log('친구 목록 로딩 시작 - 강아지 ID:', dogId);
        showLoading();

        fetch(`/dog-friends/api/list?dogId=${dogId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('API 응답 데이터:', data);

                if (data.success && Array.isArray(data.friends)) {
                    currentFriends = data.friends;
                    updateFriendsList(currentFriends, data.friendAddressMap, data.friendRequestIds);
                    updateCurrentDogDisplay(data.selectedDogName);
                    showNotification(`${data.selectedDogName}의 친구 ${data.friendCount}마리를 불러왔습니다`, 'success');
                } else {
                    console.warn('친구 데이터 없음 또는 오류:', data.message || '알 수 없는 오류');
                    currentFriends = [];
                    updateFriendsList([], {}, {});
                    showNotification(data.message || '친구 데이터를 불러올 수 없습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('API 오류:', error);
                currentFriends = [];
                updateFriendsList([], {}, {});
                showNotification('네트워크 오류가 발생했습니다.', 'error');
            })
            .finally(() => {
                hideLoading();
            });
    }

    function updateFriendsList(friends, addressMap, requestIds) {
        const container = document.querySelector('.friend_content');
        if (!container) return;

        if (!friends || friends.length === 0) {
            container.innerHTML = `
                <div class="no-friends-message">
                    <div class="no-friends-icon">🐾</div>
                    <h3>친구가 없습니다</h3>
                    <p>매칭을 통해 친구를 먼저 사귀어 보세요!</p>
                    <button onclick="window.location.href='/matching'" class="goto-matching-btn">매칭하러 가기</button>
                </div>`;
            return;
        }

        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'dog-grid-container';

        friends.forEach(friend => {
            const card = createFriendCard(friend, addressMap, requestIds);
            grid.appendChild(card);
        });

        container.appendChild(grid);
        console.log('친구 목록 UI 업데이트 완료:', friends.length, '마리');
    }

    function updateCurrentDogDisplay(dogName) {
        const count = currentFriends.length;
        const title = document.querySelector('.friend_sub_title');
        if (title && dogName) {
            title.textContent = `${dogName}의 친구들 (${count}마리)`;
        } else if (title) {
            title.textContent = '좋아하는 강아지 친구들';
        }
    }

    function createFriendCard(friend, addressMap, requestIds) {
        const card = document.createElement('div');
        card.className = 'friend_dog_card';
        card.dataset.dogId = friend.dno;

        // ✅ 이미지 처리 개선
        let imgHtml = '';
        if (friend.image && friend.image.diurl) {
            imgHtml = `<img class="f_dog_img" src="${friend.image.diurl}" alt="${friend.dname}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="f_dog_img default-img" style="display: none;">${friend.dname.charAt(0)}</div>`;
        } else {
            imgHtml = `<div class="f_dog_img default-img">${friend.dname.charAt(0)}</div>`;
        }

        const address = addressMap[friend.dno] || '위치 미공개';
        const gender = (friend.ugender && friend.ugender.doglabel) ? friend.ugender.doglabel : '성별 미공개';
        const breed = (friend.species && friend.species.name) ? friend.species.name : '견종 미공개';
        const canChat = !!requestIds[friend.dno];

        card.innerHTML = `
            <div class="f_dog_card_cont">
                ${imgHtml}
                <p class="f_dog_name">${friend.dname}</p>
                <div class="dog_keyword_row">
                    <label class="dog_keyword">${address}</label>
                    <label class="dog_keyword">${gender}</label>
                    <label class="dog_keyword">${breed}</label>
                </div>
                <div class="friend_actions">
                    <button class="friend_action_btn profile_btn" title="프로필 보기" data-dog-id="${friend.dno}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </button>
                    <button class="friend_action_btn chat_btn ${canChat ? '' : 'disabled'}" 
                            ${canChat ? '' : 'disabled'} 
                            data-friend-request-id="${requestIds[friend.dno] || ''}"
                            title="${canChat ? '채팅하기' : '채팅 불가능'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
            </div>`;

        return card;
    }

    function setupEventListeners() {
        document.addEventListener('click', function (e) {
            const profileBtn = e.target.closest('.profile_btn');
            const chatBtn = e.target.closest('.chat_btn');

            if (profileBtn) {
                const id = profileBtn.dataset.dogId;
                if (id) {
                    console.log('프로필 보기 클릭:', id);
                    window.location.href = `/friend/profile/${id}`;
                }
            }

            if (chatBtn) {
                if (chatBtn.disabled || chatBtn.classList.contains('disabled')) {
                    showNotification('채팅 불가: 친구가 아닙니다.', 'error');
                    return;
                }
                const reqId = chatBtn.dataset.friendRequestId;
                if (reqId) {
                    console.log('채팅 시작:', reqId);
                    window.open(`/chat/${reqId}`, 'chatWindow', 'width=800,height=600');
                } else {
                    showNotification('채팅 정보를 찾을 수 없습니다.', 'error');
                }
            }
        });
    }

    function setupSearchListeners() {
        if (breedSearch) breedSearch.addEventListener('input', handleSearch);
        if (nameSearch) nameSearch.addEventListener('input', handleSearch);
    }

    function handleSearch() {
        const breed = breedSearch?.value.toLowerCase() || '';
        const name = nameSearch?.value.toLowerCase() || '';
        const cards = document.querySelectorAll('.friend_dog_card');
        let count = 0;

        cards.forEach(card => {
            const dname = card.querySelector('.f_dog_name')?.textContent.toLowerCase() || '';
            const keywords = Array.from(card.querySelectorAll('.dog_keyword')).map(k => k.textContent.toLowerCase());
            const match = (!breed || keywords.some(k => k.includes(breed))) && (!name || dname.includes(name));
            card.style.display = match ? 'block' : 'none';
            if (match) count++;
        });

        updateSearchResults(count);
    }

    function updateSearchResults(count) {
        const container = document.querySelector('.friend_content');
        const existing = document.querySelector('.no-search-results');
        if (existing) existing.remove();

        if (count === 0 && currentFriends.length > 0) {
            const msg = document.createElement('div');
            msg.className = 'no-search-results';
            msg.innerHTML = `<div class="no-friends-icon">🔍</div><h3>검색 결과가 없습니다</h3><p>다른 키워드로 검색해보세요.</p>`;
            msg.style.cssText = `
                display: flex; flex-direction: column; align-items: center;
                justify-content: center; text-align: center; padding: 80px 20px;
                color: #7f8c8d; min-height: 200px;`;
            container.appendChild(msg);
        }
    }

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

    function showNotification(msg, type = 'info') {
        if (!friendNotification) return;

        friendNotification.textContent = msg;
        friendNotification.className = `friend-notification show ${type}`;

        setTimeout(() => {
            friendNotification.classList.remove('show');
        }, 3000);

        console.log(`알림 [${type}]:`, msg);
    }

    function removeGuide() {
        const guide = document.querySelector('.profile-selection-guide');
        if (guide) {
            guide.remove();
        }
    }

    // ✅ 디버깅용 글로벌 함수들
    window.friendDebug = {
        getCurrentFriends: () => currentFriends,
        getSelectedDogId: () => window.dogProfileManager?.getSelectedDogId(),
        reloadFriends: (dogId) => {
            if (dogId) loadFriendsForDog(dogId);
            else console.log('강아지 ID가 필요합니다.');
        }
    };
});