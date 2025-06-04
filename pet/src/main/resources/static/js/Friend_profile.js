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

        // 채팅 버튼
        if (chatIcon) {
            chatIcon.addEventListener('click', handleChatClick);
            chatIcon.style.cursor = 'pointer';
        }

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
        const chatIcon = document.querySelector('.profile_chat_icon');

        if (dog.friendRequestId) {
            chatIcon.classList.remove('disabled');
            chatIcon.style.cursor = 'pointer';
            chatIcon.title = '채팅하기';
        } else {
            chatIcon.classList.add('disabled');
            chatIcon.style.cursor = 'not-allowed';
            chatIcon.title = '채팅 불가능';
        }
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

    // ===== 채팅 버튼 클릭 처리 =====
    function handleChatClick() {
        if (!dogProfiles[currentDogIndex]) return;

        const dog = dogProfiles[currentDogIndex];
        const requestId = dog.friendRequestId;

        if (requestId) {
            console.log('채팅 시작:', dog.name, 'Request ID:', requestId);
            showToast(`${dog.name}와의 채팅을 시작합니다!`, 'info');

            // 새 창에서 채팅 열기
            setTimeout(() => {
                window.open(`/chat/${requestId}`, 'chatWindow', 'width=800,height=600,scrollbars=yes,resizable=yes');
            }, 500);
        } else {
            showToast('채팅 정보를 찾을 수 없습니다.', 'error');
        }
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

    // ===== 프로필 선택 안내 (친구가 없을 때) =====
    function showProfileSelectionGuide() {
        const container = document.querySelector('.f_profile');
        if (!container) return;

        container.innerHTML = `
            <div class="profile-selection-guide">
                <div class="guide-icon">🐕</div>
                <h3>친구가 없습니다</h3>
                <p>매칭을 통해 새로운 친구를 만들어보세요!</p>
                <button onclick="window.location.href='/matching'" class="guide-btn">매칭하러 가기</button>
            </div>`;
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
        chat: () => handleChatClick()
    };

    // ===== 초기화 실행 =====
    init();
});

// ===== CSS 스타일 추가 =====
const style = document.createElement('style');
style.textContent = `
    .profile-selection-guide {
        text-align: center;
        padding: 80px 20px;
        color: #7f8c8d;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        min-height: 400px;
        justify-content: center;
    }

    .guide-icon {
        font-size: 80px;
        margin-bottom: 20px;
        opacity: 0.7;
    }

    .profile-selection-guide h3 {
        font-size: 28px;
        color: #387FEB;
        margin: 0;
    }

    .profile-selection-guide p {
        font-size: 16px;
        margin: 0;
        line-height: 1.5;
        max-width: 400px;
    }

    .guide-btn {
        padding: 15px 30px;
        background: #387FEB;
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .guide-btn:hover {
        background: #2c6cd6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(56, 127, 235, 0.3);
    }

    .loading-spinner {
        text-align: center;
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #387FEB;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .profile_chat_icon.disabled {
        opacity: 0.5;
        cursor: not-allowed !important;
    }

    .profile_chat_icon:not(.disabled):hover {
        transform: scale(1.1);
        transition: transform 0.2s ease;
    }

    .f_profile_left_btn.hidden,
    .f_profile_right_btn.hidden {
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
    }
`;
document.head.appendChild(style);