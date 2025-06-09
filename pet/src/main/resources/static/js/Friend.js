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
        setupEventListeners();
        setupSearchListeners();

        if (friendDogSelect && friendDogSelect.value) {
            loadFriendsForDog(parseInt(friendDogSelect.value));
        } else {
            showProfileSelectionGuide();
        }
    }

    function setupEventListeners() {
        document.addEventListener('click', function (e) {
            const chatIcon = e.target.closest('.profile_chat_icon');
            if (chatIcon) {
                e.stopPropagation();
                if (chatIcon.classList.contains('disabled')) {
                    showNotification('채팅 불가: 친구 관계를 확인해주세요.', 'error');
                    return;
                }
                const reqId = chatIcon.dataset.friendRequestId;
                const friendName = chatIcon.dataset.friendName || '친구';
                openChatWindow(reqId, friendName);
                return;
            }

            const card = e.target.closest('.friend_dog_card');
            if (card) {
                const id = card.dataset.dogId;
                if (id) {
                    window.location.href = `/friend/profile/${id}`;
                }
            }
        });

        if (friendDogSelect) {
            friendDogSelect.addEventListener('change', function (e) {
                const selectedId = parseInt(e.target.value);
                if (selectedId) loadFriendsForDog(selectedId);
                else showProfileSelectionGuide();
            });
        }
    }

    function setupSearchListeners() {
        if (breedSearch) breedSearch.addEventListener('input', handleSearch);
        if (nameSearch) nameSearch.addEventListener('input', handleSearch);
    }

    function handleSearch() {
        const breed = breedSearch.value.toLowerCase();
        const name = nameSearch.value.toLowerCase();
        const cards = document.querySelectorAll('.friend_dog_card');

        cards.forEach(card => {
            const dname = card.querySelector('.f_dog_name')?.textContent.toLowerCase() || '';
            const keywords = Array.from(card.querySelectorAll('.dog_keyword')).map(k => k.textContent.toLowerCase());
            const match = (!breed || keywords.some(k => k.includes(breed))) && (!name || dname.includes(name));
            card.style.display = match ? 'block' : 'none';
        });
    }

    function loadFriendsForDog(dogId) {
        if (!dogId || isLoading) return;

        isLoading = true;
        friendLoadingSpinner.classList.remove('hidden');

        fetch(`/dog-friends/api/list?dogId=${dogId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.friends)) {
                    currentFriends = data.friends;
                    updateFriendsList(currentFriends, data.friendAddressMap, data.friendRequestIds);
                } else {
                    currentFriends = [];
                    updateFriendsList([], {}, {});
                }
            })
            .catch(err => {
                console.error('친구 목록 불러오기 실패:', err);
            })
            .finally(() => {
                isLoading = false;
                friendLoadingSpinner.classList.add('hidden');
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
    }

    function createFriendCard(friend, addressMap, requestIds) {
        const card = document.createElement('div');
        card.className = 'friend_dog_card';
        card.dataset.dogId = friend.dno;

        const firstLetter = friend.dname ? friend.dname.charAt(0) : '🐕';
        const imgHtml = friend.image?.diurl
            ? `<img class="f_dog_img" src="${friend.image.diurl}" alt="${friend.dname}" />`
            : `<div class="f_dog_img default-img">${firstLetter}</div>`;

        const chatIconHtml = `
      <div class="profile_chat_icon ${requestIds[friend.dno] ? '' : 'disabled'}"
           ${requestIds[friend.dno] ? `data-friend-request-id="${requestIds[friend.dno]}"` : ''}
           data-friend-name="${friend.dname || ''}"
           title="${requestIds[friend.dno] ? '채팅하기' : '채팅 불가능'}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M8,11a1,1,0,1,0,1,1A1,1,0,0,0,8,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,12,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,16,11ZM12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,.3-.71,1,1,0,0,0-.3-.7A8,8,0,1,1,12,20Z"/>
        </svg>
      </div>`;

        card.innerHTML = `
        <div class="f_dog_card_cont">
            ${imgHtml}
            <div class="name_chat_row">
                <p class="f_dog_name">${friend.dname}</p>
                ${chatIconHtml}
            </div>
            <div class="dog_keyword_row">
                <label class="dog_keyword">${addressMap[friend.dno] || '위치 미공개'}</label>
                <label class="dog_keyword">${friend.ugender?.doglabel || '성별 미공개'}</label>
                <label class="dog_keyword">${friend.species?.name || '견종 미공개'}</label>
            </div>
        </div>`;

        return card;
    }

    function openChatWindow(friendRequestId, friendName) {
        const chatUrl = `/chat/${friendRequestId}`;
        const windowName = `chat_${friendRequestId}`;
        const windowFeatures = 'width=600,height=800,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no';

        try {
            const chatWindow = window.open(chatUrl, windowName, windowFeatures);
            if (chatWindow) {
                chatWindow.focus();
                showNotification(`${friendName}와의 채팅을 시작합니다!`, 'success');
            } else {
                showNotification('팝업이 차단되었습니다.', 'error');
            }
        } catch (err) {
            console.error('채팅창 열기 실패:', err);
            showNotification('채팅창을 열 수 없습니다.', 'error');
        }
    }

    function showProfileSelectionGuide() {
        const container = document.querySelector('.friend_content');
        if (!container) return;

    }

    function showNotification(msg, type = 'info') {
        if (!friendNotification) return;
        friendNotification.textContent = msg;
        friendNotification.className = `friend-notification show ${type}`;
        setTimeout(() => friendNotification.classList.remove('show'), 3000);
    }
});