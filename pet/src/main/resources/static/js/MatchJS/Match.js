document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Match.js 초기화 시작 ===');

    // ===== 전역 변수 =====
    let currentDogs = [];
    let selectedKeywords = [];
    let currentCardIndex = 0;
    const maxKeywords = window.matchData && window.matchData.isLoggedIn ? 999 : 2;

    // DOM 요소들
    const cardStack = document.getElementById('cardStack');
    const selectedCountSpan = document.getElementById('selectedCount');
    const showAllBtn = document.getElementById('showAllBtn');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const myDogSelect = document.getElementById('myDogSelect');
    const matchModal = document.getElementById('matchModal');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // ===== 초기화 =====
    init();

    function init() {
        console.log('matchData:', window.matchData);

        if (window.matchData) {
            console.log('로그인 상태:', window.matchData.isLoggedIn);
            currentDogs = Array.isArray(window.matchData.dogs) ? window.matchData.dogs : [];
        } else {
            console.log('matchData가 없습니다.');
            currentDogs = [];
        }

        console.log('초기 강아지 수:', currentDogs.length);
        console.log('키워드 최대 개수:', maxKeywords);

        setupKeywordEvents();
        setupEventListeners();
        renderCards();
        updateKeywordCounter();
        setupMainDogSelection();

        if (window.matchData && window.matchData.showProfileSelector) {
            setupProfileSelector();
        }

        console.log('=== Match.js 초기화 완료 ===');
    }

    // 키워드 이벤트 설정
    function setupKeywordEvents() {
        const keywordBtns = document.querySelectorAll('.keyword-btn');
        console.log('키워드 버튼 개수:', keywordBtns.length);

        keywordBtns.forEach((btn, index) => {
            const keyword = btn.dataset.keyword || btn.textContent.trim();

            btn.removeEventListener('click', handleKeywordClick);
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`키워드 버튼 ${index} 클릭됨:`, keyword);
                handleKeywordClick(e, keyword);
            });

            console.log(`키워드 버튼 ${index} 설정 완료:`, keyword);
        });
    }

    function setupMainDogSelection() {
        const savedMainDogId = localStorage.getItem('selectedMainDogId') || window.selectedMainDogId;

        if (savedMainDogId && myDogSelect) {
            myDogSelect.value = savedMainDogId;
            console.log('저장된 메인 프로필 복원:', savedMainDogId);
        }

        if (window.matchData && window.matchData.isLoggedIn && window.matchData.userDogs && window.matchData.userDogs.length > 0) {
            updateMainDogDisplay();
        }
    }

    function updateMainDogDisplay() {
        const mainDogId = getSelectedMainDogId();
        const mainDog = window.matchData.userDogs.find(dog => dog.dno == mainDogId);

        if (mainDog) {
            console.log('현재 메인 프로필:', mainDog.dname);
            showNotification(`${mainDog.dname}(으)로 매칭을 진행합니다!`, 'info', 2000);
        }
    }

    function getSelectedMainDogId() {
        if (myDogSelect && myDogSelect.value) {
            return parseInt(myDogSelect.value);
        }

        const savedId = localStorage.getItem('selectedMainDogId');
        if (savedId) {
            return parseInt(savedId);
        }

        if (window.selectedMainDogId) {
            return parseInt(window.selectedMainDogId);
        }

        if (window.matchData && window.matchData.userDogs && window.matchData.userDogs.length > 0) {
            return window.matchData.userDogs[0].dno;
        }

        return null;
    }

    function setupProfileSelector() {
        if (myDogSelect) {
            myDogSelect.addEventListener('change', handleProfileChange);
        }
    }

    function handleProfileChange(e) {
        const selectedDogId = parseInt(e.target.value);
        if (selectedDogId) {
            const selectedDog = window.matchData.userDogs.find(dog => dog.dno === selectedDogId);
            if (selectedDog) {
                localStorage.setItem('selectedMainDogId', selectedDogId);
                window.selectedMainDogId = selectedDogId;
                showNotification(`${selectedDog.dname} 프로필로 매칭을 시작합니다!`, 'success');
                console.log('프로필 변경됨:', selectedDog.dname, selectedDogId);
            }
        }
    }

    function setupEventListeners() {
        if (showAllBtn) {
            showAllBtn.addEventListener('click', showAllDogs);
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFilters);
        }

        const continueBtn = document.getElementById('continueBtn');
        const chatBtn = document.getElementById('chatBtn');

        if (continueBtn) {
            continueBtn.addEventListener('click', closeModal);
        }
        if (chatBtn) {
            chatBtn.addEventListener('click', openFriendsList);
        }

        document.addEventListener('keydown', handleKeyboardNav);

        // 네비게이션 버튼 이벤트
        setupNavigationButtons();
    }

    // 네비게이션 버튼 설정
    function setupNavigationButtons() {
        // 기존 버튼 제거
        document.querySelectorAll('.card-nav-btn').forEach(btn => btn.remove());

        // 새 네비게이션 버튼 생성
        const container = document.querySelector('.card-stack-container');
        if (container && currentDogs.length > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'card-nav-btn prev';
            prevBtn.innerHTML = '‹';
            prevBtn.addEventListener('click', prevCard);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'card-nav-btn next';
            nextBtn.innerHTML = '›';
            nextBtn.addEventListener('click', nextCard);

            container.appendChild(prevBtn);
            container.appendChild(nextBtn);
        }
    }

    // 키워드 클릭 핸들러
    function handleKeywordClick(e, keyword) {
        console.log('키워드 클릭 처리 시작:', keyword);

        if (!keyword) {
            console.error('키워드가 없습니다:', e.target);
            return;
        }

        const btn = e.target;
        const isAlreadySelected = selectedKeywords.includes(keyword);

        console.log('현재 선택된 키워드:', selectedKeywords);
        console.log('클릭한 키워드:', keyword, '이미 선택됨:', isAlreadySelected);

        if (isAlreadySelected) {
            selectedKeywords = selectedKeywords.filter(k => k !== keyword);
            btn.classList.remove('selected');
            console.log('키워드 제거됨:', keyword);
        } else {
            if (selectedKeywords.length >= maxKeywords) {
                if (!window.matchData || !window.matchData.isLoggedIn) {
                    console.log('비회원 키워드 제한 도달');
                    showLoginPrompt();
                    return;
                } else {
                    showNotification('키워드 선택 개수에 제한이 없습니다.', 'info');
                }
            }

            selectedKeywords.push(keyword);
            btn.classList.add('selected');
            console.log('키워드 추가됨:', keyword);
        }

        console.log('업데이트된 선택 키워드:', selectedKeywords);
        updateKeywordCounter();

        if (selectedKeywords.length > 0) {
            autoFilterByKeywords();
        } else {
            showAllDogs();
        }
    }

    function updateKeywordCounter() {
        if (selectedCountSpan) {
            selectedCountSpan.textContent = selectedKeywords.length;
            console.log('키워드 카운터 업데이트:', selectedKeywords.length);
        }
    }

    function autoFilterByKeywords() {
        if (selectedKeywords.length === 0) {
            showAllDogs();
            return;
        }

        console.log('키워드 자동 필터링 시작:', selectedKeywords[0]);
        showLoading();
        const keyword = selectedKeywords[0];

        fetch(`/matching/search/keyword?keyword=${encodeURIComponent(keyword)}&limit=20`)
            .then(response => response.json())
            .then(dogs => {
                console.log('키워드 자동 검색 결과:', dogs.length);
                currentDogs = Array.isArray(dogs) ? dogs : [];
                currentCardIndex = 0;
                renderCards();
                hideLoading();

                if (currentDogs.length === 0) {
                    showNotification(`"${keyword}" 키워드의 강아지를 찾을 수 없습니다.`, 'info');
                }
            })
            .catch(error => {
                console.error('키워드 자동 검색 오류:', error);
                showNotification('검색 중 오류가 발생했습니다.', 'error');
                hideLoading();
            });
    }

    function showLoginPrompt() {
        const loginModal = document.createElement('div');
        loginModal.className = 'login-prompt-modal';
        loginModal.innerHTML = `
            <div class="login-prompt-content">
                <h3>🐕 더 많은 키워드 선택을 원하신다면?</h3>
                <p>비회원은 최대 2개의 키워드만 선택 가능합니다.<br>로그인하시면 무제한으로 키워드를 선택할 수 있어요!</p>
                <div class="login-prompt-buttons">
                    <button class="login-prompt-btn secondary" onclick="this.closest('.login-prompt-modal').remove()">나중에</button>
                    <button class="login-prompt-btn primary" onclick="window.location.href='/login'">로그인하기</button>
                </div>
            </div>
        `;

        loginModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        document.body.appendChild(loginModal);

        setTimeout(() => {
            if (loginModal.parentNode) {
                loginModal.remove();
            }
        }, 5000);
    }

    // 카드 렌더링 함수 (가로 3카드 슬라이드)
    function renderCards() {
        console.log('=== 카드 렌더링 시작 ===');
        console.log('현재 강아지 수:', currentDogs.length, '현재 인덱스:', currentCardIndex);

        if (!cardStack) {
            console.error('cardStack 엘리먼트를 찾을 수 없습니다.');
            return;
        }

        if (currentDogs.length === 0) {
            showEmptyState();
            return;
        }

        cardStack.innerHTML = '';

        // 3개 카드 생성 (무한 순환)
        const positions = ['left', 'center', 'right'];

        for (let i = 0; i < Math.min(3, currentDogs.length); i++) {
            let dogIndex;

            if (currentDogs.length === 1) {
                dogIndex = 0;
                if (i !== 1) continue; // 중앙에만 표시
            } else if (currentDogs.length === 2) {
                dogIndex = (currentCardIndex + i) % currentDogs.length;
                if (i === 2) continue; // 오른쪽 카드 건너뛰기
            } else {
                dogIndex = (currentCardIndex + i) % currentDogs.length;
            }

            const dog = currentDogs[dogIndex];

            if (dog) {
                console.log(`카드 ${i} 생성:`, dog.dname, `위치: ${positions[i]}`, `인덱스: ${dogIndex}`);
                const card = createDogCard(dog, positions[i]);
                if (card) {
                    cardStack.appendChild(card);
                }
            }
        }

        setupNavigationButtons();
        console.log('=== 카드 렌더링 완료 ===');
    }

    // 카드 생성 함수
    function createDogCard(dog, position) {
        const card = document.createElement('div');
        card.className = `dog-card ${position}`;
        card.dataset.dogId = dog.dno;
        card.dataset.position = position;

        let keywordTags = '';
        if (dog.keywords1 && dog.keywords1.length > 0) {
            keywordTags = dog.keywords1.map(keyword =>
                `<span class="keyword-tag">${keyword.dktag}</span>`
            ).join('');
        }

        const imageUrl = dog.image?.diurl || '/img/default-dog.png';
        const location = dog.owner?.address ?
            `${dog.owner.address.city} ${dog.owner.address.county}` : '위치 미공개';

        const isLoggedIn = window.matchData && window.matchData.isLoggedIn;

        card.innerHTML = `
            <div class="card-image" style="background-image: url('${imageUrl}')">
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="dog-name">${dog.dname}</h3>
                        ${isLoggedIn ? `
                        <button class="heart-btn" data-dog-id="${dog.dno}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </button>
                        ` : `
                        <button class="heart-btn disabled" title="좋아요는 회원만 가능합니다">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#B7B7B7" stroke-width="2" fill="none"/>
                            </svg>
                        </button>
                        `}
                    </div>
                    <div class="dog-info">
                        ${location} · ${dog.ugender?.doglabel || '성별 미공개'} · ${dog.species?.name || '견종 미공개'}
                    </div>
                    <div class="dog-keywords">
                        ${keywordTags}
                    </div>
                </div>
            </div>
        `;

        const heartBtn = card.querySelector('.heart-btn');
        if (heartBtn) {
            heartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (heartBtn.classList.contains('disabled')) {
                    showGuestLikePrompt();
                } else {
                    handleHeartClick(e);
                }
            });
        }

        return card;
    }

    // 비회원 좋아요 클릭 시 프롬프트
    function showGuestLikePrompt() {
        const guestModal = document.createElement('div');
        guestModal.className = 'login-prompt-modal';
        guestModal.innerHTML = `
            <div class="login-prompt-content">
                <h3>💝 좋아요는 회원만 가능합니다</h3>
                <p>매칭을 원하신다면 로그인 해주세요!<br>무료로 가입하고 새로운 친구를 만나보세요!</p>
                <div class="login-prompt-buttons">
                    <button class="login-prompt-btn secondary" onclick="this.closest('.login-prompt-modal').remove()">나중에</button>
                    <button class="login-prompt-btn primary" onclick="window.location.href='/login'">로그인하기</button>
                </div>
            </div>
        `;

        guestModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        document.body.appendChild(guestModal);

        setTimeout(() => {
            if (guestModal.parentNode) {
                guestModal.remove();
            }
        }, 5000);
    }

    // 다음 카드 함수
    function nextCard() {
        if (currentDogs.length <= 1) return;

        console.log('다음 카드로 이동:', currentCardIndex, '->', (currentCardIndex + 1) % currentDogs.length);
        currentCardIndex = (currentCardIndex + 1) % currentDogs.length;
        renderCards();
    }

    // 이전 카드 함수
    function prevCard() {
        if (currentDogs.length <= 1) return;

        console.log('이전 카드로 이동:', currentCardIndex, '->', (currentCardIndex - 1 + currentDogs.length) % currentDogs.length);
        currentCardIndex = (currentCardIndex - 1 + currentDogs.length) % currentDogs.length;
        renderCards();
    }

    function handleHeartClick(e) {
        e.stopPropagation();

        const dogId = parseInt(e.currentTarget.dataset.dogId);
        const heartBtn = e.currentTarget;

        if (!window.matchData || !window.matchData.isLoggedIn) {
            showGuestLikePrompt();
            return;
        }

        if (heartBtn.classList.contains('liked')) {
            showNotification('이미 좋아요를 보낸 친구입니다!', 'info');
            return;
        }

        const myDogId = getSelectedMainDogId();
        heartBtn.classList.add('animate');

        const requestData = new URLSearchParams();
        requestData.append('dogId', dogId);
        requestData.append('action', 'like');
        if (myDogId) {
            requestData.append('myDogId', myDogId);
        }

        console.log('좋아요 요청:', {
            targetDogId: dogId,
            myDogId: myDogId,
            action: 'like'
        });

        fetch('/matching/swipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestData.toString()
        })
            .then(response => response.json())
            .then(data => {
                console.log('좋아요 응답:', data);
                if (data.success) {
                    heartBtn.classList.add('liked');
                    const heartPath = heartBtn.querySelector('svg path');
                    if (heartPath) {
                        heartPath.setAttribute('fill', '#EDA9DD');
                        heartPath.setAttribute('stroke', '#EDA9DD');
                    }

                    if (data.isMatched) {
                        showMatchModal(dogId);
                    } else {
                        showNotification('💖 좋아요를 보냈습니다!', 'success');
                    }
                } else {
                    showNotification(data.message || '좋아요 처리에 실패했습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('좋아요 처리 실패:', error);
                showNotification('오류가 발생했습니다.', 'error');
            })
            .finally(() => {
                setTimeout(() => {
                    heartBtn.classList.remove('animate');
                }, 600);
            });
    }

    // 전체 보기 함수
    function showAllDogs() {
        console.log('전체 강아지 로드 시작...');
        showLoading();

        selectedKeywords = [];
        document.querySelectorAll('.keyword-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        updateKeywordCounter();

        fetch('/matching/search/all?limit=20')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(dogs => {
                console.log('전체 조회 결과:', dogs.length);
                currentDogs = Array.isArray(dogs) ? dogs : [];
                currentCardIndex = 0;
                renderCards();
                hideLoading();

                if (currentDogs.length === 0) {
                    showNotification('매칭 가능한 강아지가 없습니다.', 'info');
                } else {
                    showNotification('전체 강아지 목록을 불러왔습니다.', 'success');
                }
            })
            .catch(error => {
                console.error('전체 조회 오류:', error);
                showNotification('로딩 중 오류가 발생했습니다.', 'error');
                hideLoading();
            });
    }

    function performSearch() {
        const gender = document.getElementById('genderFilter')?.value || '';
        const breed = document.getElementById('breedFilter')?.value || '';
        const location = document.getElementById('locationFilter')?.value || '';
        const keyword1 = selectedKeywords.length > 0 ? selectedKeywords[0] : '';

        console.log('검색 조건:', { gender, breed, location, keyword1 });
        showLoading();

        const params = new URLSearchParams();
        if (gender) params.append('gender', gender);
        if (breed) params.append('breed', breed);
        if (location) params.append('location', location);
        if (keyword1) params.append('keyword1', keyword1);
        params.append('limit', '20');

        fetch(`/matching/search?${params.toString()}`)
            .then(response => response.json())
            .then(dogs => {
                console.log('복합 검색 결과:', dogs.length);
                currentDogs = Array.isArray(dogs) ? dogs : [];
                currentCardIndex = 0;
                renderCards();
                hideLoading();

                if (currentDogs.length === 0) {
                    showNotification('검색 조건에 맞는 강아지를 찾을 수 없습니다.', 'info');
                } else {
                    showNotification(`${dogs.length}마리의 강아지를 찾았습니다.`, 'success');
                }
            })
            .catch(error => {
                console.error('검색 오류:', error);
                showNotification('검색 중 오류가 발생했습니다.', 'error');
                hideLoading();
            });
    }

    function resetFilters() {
        console.log('필터 초기화');

        selectedKeywords = [];
        document.querySelectorAll('.keyword-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        updateKeywordCounter();

        const genderFilter = document.getElementById('genderFilter');
        const breedFilter = document.getElementById('breedFilter');
        const locationFilter = document.getElementById('locationFilter');

        if (genderFilter) genderFilter.value = '';
        if (breedFilter) breedFilter.value = '';
        if (locationFilter) locationFilter.value = '';

        showAllDogs();
    }

    function loadMoreCards() {
        if (selectedKeywords.length > 0) {
            autoFilterByKeywords();
        } else {
            showAllDogs();
        }
    }

    function showMatchModal(dogId) {
        const matchedDog = currentDogs.find(dog => dog.dno === dogId);
        if (!matchedDog) return;

        const modalTitle = document.getElementById('modalTitle');
        const myDogImage = document.getElementById('myDogImage');
        const myDogName = document.getElementById('myDogName');
        const friendDogImage = document.getElementById('friendDogImage');
        const friendDogName = document.getElementById('friendDogName');
        const modalMessage = document.getElementById('modalMessage');

        if (modalTitle) modalTitle.textContent = '매칭 성사! 🎉';
        if (friendDogImage) {
            friendDogImage.src = matchedDog.image?.diurl || '/img/default-dog.png';
            friendDogImage.alt = matchedDog.dname;
        }
        if (friendDogName) friendDogName.textContent = matchedDog.dname;
        if (modalMessage) modalMessage.textContent = `${matchedDog.dname}와 친구가 되었어요!`;

        const myDogId = getSelectedMainDogId();
        const myDog = window.matchData?.userDogs?.find(dog => dog.dno === myDogId);

        if (myDog) {
            if (myDogImage) {
                myDogImage.src = myDog.image?.diurl || '/img/default-dog.png';
                myDogImage.alt = myDog.dname;
            }
            if (myDogName) myDogName.textContent = myDog.dname;
        } else if (window.matchData?.userDogs && window.matchData.userDogs.length > 0) {
            const firstDog = window.matchData.userDogs[0];
            if (myDogImage) {
                myDogImage.src = firstDog.image?.diurl || '/img/default-dog.png';
                myDogImage.alt = firstDog.dname;
            }
            if (myDogName) myDogName.textContent = firstDog.dname;
        }

        if (matchModal) {
            matchModal.classList.add('show');
        }
    }

    function closeModal() {
        if (matchModal) {
            matchModal.classList.remove('show');
        }
    }

    function openFriendsList() {
        showNotification('친구 목록으로 이동합니다!', 'success');
        setTimeout(() => {
            window.location.href = '/dog-friends/list';
        }, 1000);
        closeModal();
    }

    function handleKeyboardNav(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevCard();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextCard();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
        }
    }

    function showLoading() {
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }
    }

    function hideLoading() {
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    }

    function showEmptyState() {
        console.log('빈 상태 표시');
        if (cardStack) {
            cardStack.innerHTML = `
               <div class="empty-state">
                   <div class="empty-icon">🐕</div>
                   <h3>더 이상 새로운 친구가 없어요</h3>
                   <p>필터를 조정하거나 나중에 다시 확인해보세요!</p>
                   <button onclick="location.reload()" class="action-btn primary">새로고침</button>
               </div>
           `;
        }
    }

    function showNotification(message, type = 'info', duration = 3000) {
        const existingNotification = document.querySelector('.match-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        let bgColor = '#387FEB';
        if (type === 'success') bgColor = '#4CAF50';
        if (type === 'error') bgColor = '#f44336';

        const notification = document.createElement('div');
        notification.className = 'match-notification';
        notification.innerHTML = message;
        notification.style.cssText = `
           position: fixed;
           top: 20px;
           left: 50%;
           transform: translateX(-50%);
           background: ${bgColor};
           color: white;
           padding: 15px 25px;
           border-radius: 25px;
           font-weight: 600;
           z-index: 10000;
           box-shadow: 0 4px 15px rgba(0,0,0,0.2);
           animation: slideDownNotification 0.3s ease-out;
       `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideUpNotification 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
});

// CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
   @keyframes slideDownNotification {
       from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
       to { transform: translateX(-50%) translateY(0); opacity: 1; }
   }
   @keyframes slideUpNotification {
      from { transform: translateX(-50%) translateY(0); opacity: 1; }
      to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
  
  .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #7f8c8d;
  }
  
  .empty-state h3 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #495057;
  }
  
  .empty-state p {
      font-size: 16px;
      margin: 0 0 20px 0;
  }
  
  .heart-btn.disabled {
      opacity: 0.6;
      cursor: not-allowed;
  }
  
  .login-prompt-content {
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      width: 90%;
  }
  
  .login-prompt-content h3 {
      font-size: 24px;
      color: #387FEB;
      margin-bottom: 15px;
  }
  
  .login-prompt-content p {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.5;
  }
  
  .login-prompt-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
  }
  
  .login-prompt-btn {
      padding: 12px 25px;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
  }
  
  .login-prompt-btn.primary {
      background: #387FEB;
      color: white;
  }
  
  .login-prompt-btn.secondary {
      background: #f8f9fa;
      color: #495057;
      border: 2px solid #e9ecef;
  }
  
  .login-prompt-btn:hover {
      transform: translateY(-2px);
  }
`;
document.head.appendChild(style);