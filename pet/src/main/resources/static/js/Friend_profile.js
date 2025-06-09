document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Friend_profile.js 초기화 시작 ===');
    console.log('dogProfiles:', dogProfiles);
    console.log('currentDogIndex:', currentDogIndex);

    // ===== 전역 변수 =====
    // let currentDogIndex = 0; // HTML에서 전달받음
    // const dogProfiles = []; // HTML에서 전달받음

    // ===== DOM 요소 참조 =====
    let starElement;
    let leftBtn;
    let rightBtn;
    let deleteBtn;
    let cancelBtn;
    let confirmBtn;
    let deleteModal;
    let toastMsg;
    let chatIcon;

    // ===== 초기화 =====
    function init() {
        console.log('Friend_profile.js 초기화 중...');

        // 요소 참조 초기화
        initElements();

        // 이벤트 리스너 설정
        setupEventListeners();

        // 초기 상태 설정
        updateNavigationButtons();
        updateFavoriteState();
        updateChatButton();

        console.log('=== Friend_profile.js 초기화 완료 ===');
    }

    // ===== 요소 참조 초기화 =====
    function initElements() {
        starElement = document.getElementById('favorite-star');
        leftBtn = document.querySelector('.f_profile_left_btn');
        rightBtn = document.querySelector('.f_profile_right_btn');
        deleteBtn = document.getElementById('delete-friend-btn');
        cancelBtn = document.getElementById('cancel-delete');
        confirmBtn = document.getElementById('confirm-delete');
        deleteModal = document.getElementById('delete-modal');
        toastMsg = document.getElementById('toast-message');

        // ✅ 채팅 아이콘 선택 (disabled가 아닌 것)
        chatIcon = document.querySelector('.profile_chat_icon:not(.disabled)');
    }

    // ===== 이벤트 리스너 설정 =====
    function setupEventListeners() {
        // 네비게이션 버튼
        if (leftBtn) {
            leftBtn.addEventListener('click', showPreviousDog);
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', showNextDog);
        }

        // 즐겨찾기 버튼
        if (starElement) {
            starElement.addEventListener('click', toggleFavorite);
        }

        // 삭제 관련 버튼
        if (deleteBtn) {
            deleteBtn.addEventListener('click', showDeleteModal);
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideDeleteModal);
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', deleteFriend);
        }

        // ✅ 채팅 버튼 이벤트 설정
        setupChatIconEvents();

        // 키보드 네비게이션
        document.addEventListener('keydown', handleKeyboardNavigation);

        // 모달 외부 클릭 시 닫기
        if (deleteModal) {
            deleteModal.addEventListener('click', function(e) {
                if (e.target === deleteModal) {
                    hideDeleteModal();
                }
            });
        }
    }

    // ✅ 채팅 아이콘 이벤트 설정 함수
    function setupChatIconEvents() {
        // 모든 채팅 아이콘에 이벤트 리스너 추가 (활성화된 것과 비활성화된 것 모두)
        const allChatIcons = document.querySelectorAll('.profile_chat_icon');

        allChatIcons.forEach(icon => {
            icon.addEventListener('click', handleChatIconClick);
            icon.style.cursor = 'pointer';
        });
    }

    // ✅ 채팅 아이콘 클릭 처리
    function handleChatIconClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const chatIcon = e.currentTarget;

        // disabled 상태 확인
        if (chatIcon.classList.contains('disabled')) {
            showToast('채팅을 시작할 수 없습니다. 친구 관계를 확인해주세요.', 'error');
            return;
        }

        // friendRequestId 확인
        const friendRequestId = chatIcon.dataset.friendRequestId;

        if (!friendRequestId) {
            showToast('채팅 정보를 찾을 수 없습니다.', 'error');
            return;
        }

        // 현재 강아지 정보
        const currentDog = dogProfiles[currentDogIndex];
        if (!currentDog) {
            showToast('강아지 정보를 찾을 수 없습니다.', 'error');
            return;
        }

        console.log('채팅 시작:', currentDog.name, 'Request ID:', friendRequestId);

        // 채팅창 열기
        openChatWindow(friendRequestId, currentDog.name);
    }

    // ✅ 채팅창 열기 함수
    function openChatWindow(friendRequestId, dogName) {
        const chatUrl = `/chat/${friendRequestId}`;
        const windowName = `chat_${friendRequestId}`;
        const windowFeatures = 'width=600,height=800,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no';

        try {
            const chatWindow = window.open(chatUrl, windowName, windowFeatures);

            if (chatWindow) {
                chatWindow.focus();
                showToast(`${dogName}와의 채팅을 시작합니다!`, 'success');
            } else {
                // 팝업이 차단된 경우
                showToast('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.', 'error');

                // 대안으로 현재 창에서 열기 옵션 제공
                setTimeout(() => {
                    if (confirm('팝업이 차단되어 있습니다. 현재 창에서 채팅을 여시겠습니까?')) {
                        window.location.href = chatUrl;
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('채팅창 열기 실패:', error);
            showToast('채팅창을 열 수 없습니다.', 'error');
        }
    }

    // ===== 이전 강아지 프로필 표시 =====
    function showPreviousDog() {
        if (currentDogIndex > 0 && dogProfiles.length > 1) {
            navigateToProfile(currentDogIndex - 1);
        }
    }

    // ===== 다음 강아지 프로필 표시 =====
    function showNextDog() {
        if (currentDogIndex < dogProfiles.length - 1 && dogProfiles.length > 1) {
            navigateToProfile(currentDogIndex + 1);
        }
    }

    // ===== 프로필 네비게이션 (URL 변경) =====
    function navigateToProfile(newIndex) {
        if (newIndex < 0 || newIndex >= dogProfiles.length) {
            console.warn('잘못된 인덱스:', newIndex);
            return;
        }

        const targetDog = dogProfiles[newIndex];
        if (targetDog && targetDog.id) {
            console.log('다른 강아지 프로필로 이동:', targetDog.name, 'ID:', targetDog.id);

            // 로딩 표시
            showLoading();

            // 페이지 이동
            window.location.href = `/friend/profile/${targetDog.id}`;
        } else {
            console.error('프로필 데이터가 없습니다:', targetDog);
            showToast('프로필을 찾을 수 없습니다.', 'error');
        }
    }

    // ===== 네비게이션 버튼 상태 업데이트 =====
    function updateNavigationButtons() {
        if (!leftBtn || !rightBtn) return;

        console.log('네비게이션 버튼 업데이트:', {
            총개수: dogProfiles.length,
            현재인덱스: currentDogIndex
        });

        // 강아지가 1마리만 있거나 없는 경우 양쪽 버튼 모두 숨기기
        if (dogProfiles.length <= 1) {
            leftBtn.classList.add('hidden');
            rightBtn.classList.add('hidden');
            return;
        }

        // 첫 번째 강아지인 경우 왼쪽 버튼 숨기기
        if (currentDogIndex === 0) {
            leftBtn.classList.add('hidden');
            rightBtn.classList.remove('hidden');
        }
        // 마지막 강아지인 경우 오른쪽 버튼 숨기기
        else if (currentDogIndex === dogProfiles.length - 1) {
            rightBtn.classList.add('hidden');
            leftBtn.classList.remove('hidden');
        }
        // 중간 강아지인 경우 양쪽 버튼 모두 표시
        else {
            leftBtn.classList.remove('hidden');
            rightBtn.classList.remove('hidden');
        }
    }

    // ===== 즐겨찾기 상태 업데이트 =====
    function updateFavoriteState() {
        if (!starElement || !dogProfiles[currentDogIndex]) return;

        const dog = dogProfiles[currentDogIndex];
        const path = starElement.querySelector('path');

        if (dog.isFavorite) {
            starElement.classList.add('active');
            if (path) {
                path.setAttribute('fill', '#EDA9DD');
                path.setAttribute('stroke', '#EDA9DD');
            }
        } else {
            starElement.classList.remove('active');
            if (path) {
                path.setAttribute('fill', '#B7B7B7');
                path.setAttribute('stroke', '#B7B7B7');
            }
        }
    }

    // ===== 채팅 버튼 상태 업데이트 =====
    function updateChatButton() {
        if (!dogProfiles[currentDogIndex]) return;

        const dog = dogProfiles[currentDogIndex];

        // 모든 채팅 아이콘 찾기
        const allChatIcons = document.querySelectorAll('.profile_chat_icon');

        allChatIcons.forEach(chatIcon => {
            if (dog.friendRequestId) {
                chatIcon.classList.remove('disabled');
                chatIcon.style.cursor = 'pointer';
                chatIcon.title = '채팅하기';
                chatIcon.dataset.friendRequestId = dog.friendRequestId;
            } else {
                chatIcon.classList.add('disabled');
                chatIcon.style.cursor = 'not-allowed';
                chatIcon.title = '채팅 불가능';
                delete chatIcon.dataset.friendRequestId;
            }
        });
    }

    // ===== 즐겨찾기 토글 =====
    function toggleFavorite() {
        if (!dogProfiles[currentDogIndex]) return;

        const dog = dogProfiles[currentDogIndex];
        const newFavoriteState = !dog.isFavorite;

        console.log('즐겨찾기 상태 변경:', dog.name, '현재:', dog.isFavorite, '→', newFavoriteState);

        // 서버에 즐겨찾기 상태 저장 API 호출
        fetch('/friend/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dogId: dog.id,
                isFavorite: newFavoriteState
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 클라이언트 상태 업데이트
                    dog.isFavorite = newFavoriteState;
                    updateFavoriteState();

                    const message = newFavoriteState
                        ? `${dog.name}이(가) 즐겨찾기에 추가되었습니다.`
                        : `${dog.name}이(가) 즐겨찾기에서 제거되었습니다.`;

                    showToast(message, 'success');
                } else {
                    showToast(data.message || '즐겨찾기 처리에 실패했습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('즐겨찾기 처리 오류:', error);
                showToast('오류가 발생했습니다.', 'error');
            });
    }

    // ===== 삭제 모달 표시 =====
    function showDeleteModal() {
        if (deleteModal) {
            deleteModal.classList.add('active');

            // 현재 강아지 이름을 모달에 표시
            if (dogProfiles[currentDogIndex]) {
                const modalTitle = deleteModal.querySelector('.modal-title');
                if (modalTitle) {
                    modalTitle.textContent = `정말 ${dogProfiles[currentDogIndex].name}와의 친구 관계를 삭제하시겠습니까?`;
                }
            }
        }
    }

    // ===== 삭제 모달 숨기기 =====
    function hideDeleteModal() {
        if (deleteModal) {
            deleteModal.classList.remove('active');
        }
    }

    // ===== 친구 삭제 처리 =====
    function deleteFriend() {
        if (!dogProfiles[currentDogIndex]) return;

        const currentDog = dogProfiles[currentDogIndex];
        const dogName = currentDog.name;
        const dogId = currentDog.id;

        console.log('친구 삭제 요청:', dogName, 'ID:', dogId);

        // 로딩 표시
        showLoading();

        // 서버에 삭제 요청
        fetch(`/friend/delete/${dogId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            })
            .then(data => {
                if (data.success) {
                    showToast(`${dogName}이(가) 친구 목록에서 삭제되었습니다.`, 'success');

                    // 잠시 후 친구 목록으로 돌아가기
                    setTimeout(() => {
                        window.location.href = '/dog-friends/list';
                    }, 1500);
                } else {
                    throw new Error(data.message || '삭제 실패');
                }
            })
            .catch(error => {
                console.error('친구 삭제 오류:', error);
                showToast('친구 삭제에 실패했습니다.', 'error');
                hideLoading();
            })
            .finally(() => {
                hideDeleteModal();
            });
    }

    // ===== 키보드 네비게이션 =====
    function handleKeyboardNavigation(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (currentDogIndex > 0) {
                    showPreviousDog();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentDogIndex < dogProfiles.length - 1) {
                    showNextDog();
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (deleteModal && deleteModal.classList.contains('active')) {
                    hideDeleteModal();
                }
                break;
            case 'f':
            case 'F':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    toggleFavorite();
                }
                break;
        }
    }

    // ===== 로딩 표시 =====
    function showLoading() {
        const loader = document.createElement('div');
        loader.id = 'profile-loader';
        loader.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>로딩 중...</p>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(loader);
    }

    // ===== 로딩 숨기기 =====
    function hideLoading() {
        const loader = document.getElementById('profile-loader');
        if (loader) {
            loader.remove();
        }
    }

    // ===== 토스트 메시지 표시 =====
    function showToast(message, type = 'info') {
        if (!toastMsg) {
            console.warn('토스트 메시지 엘리먼트를 찾을 수 없습니다.');
            return;
        }

        // 타입에 따른 스타일 적용
        toastMsg.className = 'toast-notification show';

        switch(type) {
            case 'success':
                toastMsg.style.backgroundColor = '#28a745';
                break;
            case 'error':
                toastMsg.style.backgroundColor = '#dc3545';
                break;
            case 'info':
            default:
                toastMsg.style.backgroundColor = '#387FEB';
                break;
        }

        toastMsg.textContent = message;

        // 3초 후 토스트 메시지 숨기기
        setTimeout(() => {
            toastMsg.classList.remove('show');
        }, 3000);

        console.log(`토스트 메시지 [${type}]:`, message);
    }

    // ===== 글로벌 함수들 =====
    window.goBackToFriendList = function() {
        showLoading();
        window.location.href = '/dog-friends/list';
    };

    window.refreshProfile = function() {
        showLoading();
        window.location.reload();
    };

    // ===== 디버깅용 글로벌 함수들 =====
    window.friendProfileDebug = {
        getCurrentDog: () => dogProfiles[currentDogIndex],
        getAllDogs: () => dogProfiles,
        getCurrentIndex: () => currentDogIndex,
        navigateTo: (index) => navigateToProfile(index),
        toggleFav: () => toggleFavorite(),
        openChat: (friendRequestId, dogName) => openChatWindow(friendRequestId, dogName)
    };

    // ===== 초기화 실행 =====
    init();
});