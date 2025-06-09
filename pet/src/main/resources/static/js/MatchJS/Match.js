document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Match.js 초기화 시작 ===');

    // ===== 전역 변수 =====
    let currentDogs = [];
    let selectedKeywords = [];
    let swiper = null;
    const maxKeywords = window.matchData && window.matchData.isLoggedIn ? 999 : 2;

    // DOM 요소들
    const selectedCountSpan = document.getElementById('selectedCount');
    const showAllBtn = document.getElementById('showAllBtn');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const myDogSelect = document.getElementById('myDogSelect');
    const matchModal = document.getElementById('matchModal');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // ✅ 프로필 변경 이벤트 중복 방지 플래그
    let isHandlingProfileChange = false;

    // ===== 초기화 =====
    function init() {
        console.log('=== Match.js 초기화 시작 ===');

        setupKeywordEvents();
        setupEventListeners();
        setupProfileChangeListener();
        setupBreedAutocomplete();
        setupAddressDropdown();
        initializeSwiper();

        // ✅ 핵심 수정: 항상 매칭 데이터 표시 (프로필 선택 여부와 관계없이)
        handleInitialState();

        console.log('=== Match.js 초기화 완료 ===');
    }

    // ===== 스와이퍼 초기화 (동적 슬라이드 수 적용) =====
    function initializeSwiper() {
        // 스와이퍼 초기화
        swiper = new Swiper(".mySwiper", {
            slidesPerView: 'auto', // ✅ 동적 슬라이드 수
            spaceBetween: 30,
            centeredSlides: true,
            loop: false, // ✅ 기본은 루프 비활성화
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                enabled: false // ✅ 페이지네이션 비활성화
            },
            keyboard: {
                enabled: true,
            },
            // 반응형 설정
            breakpoints: {
                // 모바일
                480: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                // 태블릿
                768: {
                    slidesPerView: 1,
                    spaceBetween: 25,
                },
                // 데스크톱
                1200: {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                }
            },
            // 터치/드래그 설정
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            // ✅ 슬라이드 효과 개선
            effect: 'slide',
            speed: 500,
        });

        console.log('스와이퍼 초기화 완료 (동적 슬라이드 수 적용)');
    }

    // ===== ✅ 수정: 초기 상태 처리 (항상 매칭 데이터 표시) =====
    function handleInitialState() {
        console.log('초기 상태 처리 시작...');

        // ✅ 모든 경우에 매칭 데이터 로드 (프로필 선택과 무관하게)
        loadInitialMatchingData();
        updateKeywordCounter();
    }

    // ===== ✅ 수정: 초기 매칭 데이터 로드 (로딩 시간 단축) =====
    function loadInitialMatchingData() {
        console.log('초기 매칭 데이터 로드 시작...');
        showLoading('매칭 데이터 로딩 중...');

        // ✅ 로딩 시간 단축: limit을 10으로 줄임
        fetch('/matching/api/initial?limit=10')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('초기 데이터 로드 응답:', data);

                if (data.success && Array.isArray(data.dogs)) {
                    currentDogs = data.dogs;
                    console.log('로드된 강아지 수:', currentDogs.length);

                    renderCards();

                    if (currentDogs.length === 0) {
                        showNotification('매칭 가능한 강아지가 없습니다.', 'info');
                    } else {
                        showNotification(`${currentDogs.length}마리의 친구를 찾았습니다!`, 'success');
                    }
                } else {
                    console.warn('데이터 로드 실패:', data.message || '알 수 없는 오류');
                    currentDogs = [];
                    showEmptyState();
                    showNotification('데이터를 불러올 수 없습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('초기 데이터 로드 실패:', error);
                currentDogs = [];
                showEmptyState();
                showNotification('네트워크 오류가 발생했습니다.', 'error');
            })
            .finally(() => {
                hideLoading();
            });
    }

    // 프로필 드롭다운 포커스
    window.focusProfileDropdown = function() {
        if (myDogSelect) {
            myDogSelect.focus();
            myDogSelect.click();
        }
    };

    // ===== ✅ 수정: 프로필 변경 리스너 (2마리 이상일 때만 필터 적용) =====
    function setupProfileChangeListener() {
        window.addEventListener('globalProfileChanged', function(e) {
            // ✅ 중복 처리 방지
            if (isHandlingProfileChange) {
                console.log('프로필 변경 처리 중이므로 무시');
                return;
            }

            isHandlingProfileChange = true;

            const { dogId, dogName } = e.detail;
            console.log('매칭페이지: 프로필 변경 감지:', dogName || '선택 해제');

            if (dogId) {
                // 프로필 선택됨 - 필터링 후 재렌더링
                showNotification(`${dogName}(으)로 매칭을 시작합니다!`, 'success');
                filterDogsForCurrentProfile();
                renderCards();
            } else {
                // 프로필 선택 해제됨 - 필터 없이 전체 데이터 표시
                console.log('프로필 선택 해제 - 전체 데이터 표시');
                // 서버에서 새로 로드하지 않고 현재 데이터 그대로 표시
                renderCards();
            }

            // 플래그 해제
            setTimeout(() => {
                isHandlingProfileChange = false;
            }, 1000);
        });
    }

    // ===== ✅ 수정: 현재 프로필에 맞는 강아지 필터링 (선택된 강아지가 있을 때만) =====
    function filterDogsForCurrentProfile() {
        if (!window.matchData || !window.matchData.isLoggedIn) {
            console.log('비회원이므로 필터링하지 않음');
            return;
        }

        const userDogsCount = window.matchData?.userDogs?.length || 0;
        if (userDogsCount === 0) {
            console.log('등록된 강아지가 없어서 필터링하지 않음');
            return;
        }

        let myDogId;
        if (userDogsCount === 1) {
            // 1마리면 자동으로 해당 강아지 ID 사용
            myDogId = window.matchData.userDogs[0].dno;
            console.log('강아지 1마리 - 자동 선택된 강아지 ID:', myDogId);
        } else {
            // 2마리 이상이면 선택된 강아지 ID 사용 (선택되지 않으면 필터링 안함)
            myDogId = window.dogProfileManager?.getSelectedDogId();
            if (!myDogId) {
                console.log('강아지 2마리 이상이지만 선택되지 않음 - 필터링 안함');
                return; // ✅ 필터링하지 않고 전체 데이터 표시
            }
            console.log('선택된 강아지 ID:', myDogId);
        }

        console.log('현재 프로필용 강아지 필터링 시작, 메인 강아지 ID:', myDogId);

        // ✅ 수정: 강아지별 개별 localStorage 키 사용
        const likedByCurrentDog = JSON.parse(localStorage.getItem(`likedByDog_${myDogId}`) || '[]');
        console.log('현재 강아지가 좋아요한 강아지 ID들:', likedByCurrentDog);

        // 같은 유저(가족)의 강아지들 제외
        const myUserDogIds = window.matchData.userDogs ? window.matchData.userDogs.map(dog => dog.dno) : [];
        console.log('내 가족 강아지 ID들:', myUserDogIds);

        const beforeCount = currentDogs.length;

        currentDogs = currentDogs.filter(dog => {
            // 자기 자신과 가족 강아지들 제외
            if (myUserDogIds.includes(dog.dno)) {
                return false;
            }

            // ✅ 수정: 현재 선택된 강아지가 이미 좋아요한 강아지들만 제외 (다른 강아지는 포함)
            if (likedByCurrentDog.includes(dog.dno)) {
                return false;
            }

            return true;
        });

        const afterCount = currentDogs.length;
        console.log(`필터링 완료: ${beforeCount}마리 -> ${afterCount}마리`);
    }

    // ===== ✅ 수정: 좋아요 처리 함수 (하트 색상 변경 강화) =====
    function handleHeartClick(e) {
        e.stopPropagation();

        const dogId = parseInt(e.currentTarget.dataset.dogId);
        const heartBtn = e.currentTarget;

        // 비회원 체크
        if (!window.matchData || !window.matchData.isLoggedIn) {
            showGuestLikePrompt();
            return;
        }

        // ✅ 프로필 선택 체크 (수정 - 2마리 이상일 때만)
        const userDogsCount = window.matchData?.userDogs?.length || 0;
        let myDogId;

        if (userDogsCount === 0) {
            showNotification('먼저 강아지를 등록해주세요!', 'error');
            return;
        } else if (userDogsCount === 1) {
            // 1마리면 자동으로 해당 강아지 사용
            myDogId = window.matchData.userDogs[0].dno;
        } else {
            // ✅ 수정: 2마리 이상이면 선택된 강아지 사용 (미선택 시 프롬프트)
            myDogId = window.dogProfileManager?.getSelectedDogId();
            if (!myDogId) {
                showProfileRequiredPrompt();
                return;
            }
        }

        // ✅ 수정: 강아지별 개별 좋아요 체크
        const liked = JSON.parse(localStorage.getItem(`likedByDog_${myDogId}`) || '[]');
        if (liked.includes(dogId)) {
            showNotification('이미 좋아요를 누른 친구입니다!', 'info');
            return;
        }

        // 애니메이션 시작
        heartBtn.classList.add('animate');

        const requestData = new URLSearchParams();
        requestData.append('dogId', dogId);
        requestData.append('action', 'like');
        requestData.append('myDogId', myDogId);

        console.log('좋아요 요청:', {
            dogId: dogId,
            myDogId: myDogId,
            action: 'like'
        });

        fetch('/matching/swipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: requestData.toString()
        })
            .then(response => {
                console.log('서버 응답 상태:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('좋아요 응답 데이터:', data);

                if (data.success) {
                    // ✅ 수정: 강아지별 개별 localStorage에 저장
                    liked.push(dogId);
                    localStorage.setItem(`likedByDog_${myDogId}`, JSON.stringify(liked));
                    console.log(`강아지 ${myDogId}의 좋아요 목록에 ${dogId} 추가됨`);

                    // ✅ 수정: 하트 상태 변경 강화
                    updateHeartState(heartBtn, true);

                    // 매칭 성사 체크
                    if (data.isMatched === true || data.isMatched === 'true' || data.matched === true) {
                        console.log('🎉 매칭 성사! 모달 표시');
                        setTimeout(() => {
                            showMatchModal(dogId);
                        }, 800);
                    } else {
                        console.log('💖 일반 좋아요');
                        showNotification('💖 좋아요를 보냈습니다!', 'success');
                        setTimeout(() => {
                            removeCurrentDogFromView(dogId);
                        }, 1500);
                    }

                } else {
                    console.error('좋아요 실패:', data.message);
                    showNotification(data.message || '좋아요 처리에 실패했습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('좋아요 처리 실패:', error);
                showNotification('오류가 발생했습니다.', 'error');
            })
            .finally(() => {
                setTimeout(() => heartBtn.classList.remove('animate'), 600);
            });
    }

    // ===== ✅ 새로 추가: 하트 상태 업데이트 함수 =====
    function updateHeartState(heartBtn, isLiked) {
        const heartSvg = heartBtn.querySelector('svg');
        const heartPath = heartSvg ? heartSvg.querySelector('path') : null;

        if (isLiked) {
            // 좋아요 상태로 변경
            heartBtn.classList.add('liked');
            heartBtn.classList.add('disabled');

            if (heartPath) {
                heartPath.setAttribute('fill', '#FF69B4');
                heartPath.setAttribute('stroke', '#FF1493');
            }

            if (heartSvg) {
                heartSvg.style.fill = '#FF69B4';
                heartSvg.style.stroke = '#FF1493';
            }

            console.log('하트 상태 업데이트: 좋아요 완료');
        } else {
            // 기본 상태로 변경
            heartBtn.classList.remove('liked');
            heartBtn.classList.remove('disabled');

            if (heartPath) {
                heartPath.setAttribute('fill', '#F5F6F8');
                heartPath.setAttribute('stroke', 'white');
            }

            if (heartSvg) {
                heartSvg.style.fill = '#F5F6F8';
                heartSvg.style.stroke = 'white';
            }

            console.log('하트 상태 업데이트: 기본 상태');
        }
    }

    // ===== ✅ 수정: 프로필 선택 필수 안내 모달 (CSS 클래스 사용) =====
    function showProfileRequiredPrompt() {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.profile-required-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const profileModal = document.createElement('div');
        profileModal.className = 'profile-required-modal';
        profileModal.innerHTML = `
            <div class="profile-required-content">
                <h3>🐕 강아지를 선택해주세요</h3>
                <p>좋아요를 누르려면 먼저 어떤 강아지로<br>매칭할지 선택해주세요!</p>
                <div class="profile-required-buttons">
                    <button class="profile-required-btn secondary" onclick="this.closest('.profile-required-modal').remove()">나중에</button>
                    <button class="profile-required-btn primary" onclick="focusProfileDropdown(); this.closest('.profile-required-modal').remove();">선택하기</button>
                </div>
            </div>
        `;

        document.body.appendChild(profileModal);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (profileModal.parentNode) {
                profileModal.remove();
            }
        }, 5000);
    }

    // ===== 키워드 이벤트 설정 =====
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
        });
    }

    // ===== ✅ 수정: 키워드 클릭 처리 (비회원일 때 모달 표시) =====
    function handleKeywordClick(e, keyword) {
        e.preventDefault();
        e.stopPropagation();

        if (!keyword) return;

        const btn = e.target;

        // ✅ 수정: 비회원일 때 키워드 선택 제한 모달 표시
        if (!window.matchData?.isLoggedIn) {
            showKeywordLoginPrompt();
            return;
        }

        const isAlreadySelected = selectedKeywords.includes(keyword);

        if (isAlreadySelected) {
            selectedKeywords = selectedKeywords.filter(k => k !== keyword);
            btn.classList.remove('selected');
        } else {
            selectedKeywords.push(keyword);
            btn.classList.add('selected');
        }

        updateKeywordCounter();

        // 키워드 선택/해제 시 자동 필터링
        if (selectedKeywords.length > 0) {
            autoFilterByKeywords();
        } else {
            showAllDogs();
        }
    }

    // ===== ✅ 새로 추가: 키워드 선택 로그인 프롬프트 =====
    function showKeywordLoginPrompt() {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.login-prompt-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const loginModal = document.createElement('div');
        loginModal.className = 'login-prompt-modal';
        loginModal.innerHTML = `
          <div class="login-prompt-content">
              <h3>🐕 키워드 선택은 로그인 후 이용해주세요</h3>
              <p>로그인하시면 무제한으로 키워드를 선택하고<br>더 정확한 매칭을 받을 수 있어요!</p>
              <div class="login-prompt-buttons">
                  <button class="login-prompt-btn secondary" onclick="this.closest('.login-prompt-modal').remove()">나중에</button>
                  <button class="login-prompt-btn primary" onclick="window.location.href='/login'">로그인하기</button>
              </div>
          </div>
      `;

        document.body.appendChild(loginModal);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (loginModal.parentNode) {
                loginModal.remove();
            }
        }, 5000);
    }

    // ===== 키워드 자동 필터링 =====
    function autoFilterByKeywords() {
        if (selectedKeywords.length === 0) {
            showAllDogs();
            return;
        }

        console.log('키워드 자동 필터링 시작:', selectedKeywords);

        showLoading('키워드 검색 중...');

        const keywordParams = selectedKeywords.map(k => `keywords=${encodeURIComponent(k)}`).join('&');
        fetch(`/matching/search/keywords?${keywordParams}&limit=20`)
            .then(response => response.json())
            .then(dogs => {
                currentDogs = Array.isArray(dogs) ? dogs : [];

                // ✅ 수정: 로그인 상태이고 프로필이 선택된 경우만 필터링
                if (window.matchData?.isLoggedIn) {
                    const userDogsCount = window.matchData?.userDogs?.length || 0;
                    if (userDogsCount === 1 || (userDogsCount >= 2 && window.dogProfileManager?.getSelectedDogId())) {
                        filterDogsForCurrentProfile();
                    }
                }

                renderCards();
                hideLoading();

                if (currentDogs.length === 0) {
                    showNotification('해당 키워드를 가진 친구가 없습니다.', 'info');
                } else {
                    showNotification(`${selectedKeywords.join(', ')} 키워드로 ${currentDogs.length}마리를 찾았습니다!`, 'success');
                }
            })
            .catch(error => {
                console.error('키워드 검색 실패:', error);
                showNotification('검색 오류가 발생했습니다.', 'error');
                hideLoading();
            });
    }

    // ===== 주소 드롭다운 설정 =====
    function setupAddressDropdown() {
        const sido = document.getElementById("cityFilter");
        const sigungu = document.getElementById("countyFilter");
        const dong = document.getElementById("townFilter");

        if (!sido || !sigungu || !dong) return;

        fetch("/api/regions/sido")
            .then(res => res.json())
            .then(list => {
                list.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.code;
                    option.textContent = item.name;
                    sido.appendChild(option);
                });
            });

        sido.addEventListener("change", () => {
            const code = sido.value;
            sigungu.disabled = !code;
            sigungu.innerHTML = `<option value="">시/군/구 선택</option>`;
            dong.disabled = true;
            dong.innerHTML = `<option value="">읍/면/동 선택</option>`;
            if (!code) return;

            fetch(`/api/regions/sigungu?code=${encodeURIComponent(code)}`)
                .then(res => res.json())
                .then(list => {
                    list.forEach(item => {
                        const option = document.createElement("option");
                        option.value = item.code;
                        option.textContent = item.name;
                        sigungu.appendChild(option);
                    });
                });
        });

        sigungu.addEventListener("change", () => {
            const code = sigungu.value;
            dong.disabled = !code;
            dong.innerHTML = `<option value="">읍/면/동 선택</option>`;
            if (!code) return;

            fetch(`/api/regions/dong?code=${encodeURIComponent(code)}`)
                .then(res => res.json())
                .then(list => {
                    list.forEach(item => {
                        const option = document.createElement("option");
                        option.value = item.code;
                        option.textContent = item.name;
                        dong.appendChild(option);
                    });
                });
        });
    }

    // ===== 이벤트 리스너 설정 =====
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
    }

    // ===== 견종 자동완성 설정 =====
    function setupBreedAutocomplete() {
        const input = document.getElementById('speciesInput');
        const list = document.getElementById('speciesAutocompleteList');
        const hidden = document.getElementById('selectedSpeciesId');

        if (!input || !list || !hidden) return;

        input.addEventListener('input', () => {
            const keyword = input.value.trim();
            if (!keyword) {
                list.innerHTML = '';
                hidden.value = '';
                return;
            }

            fetch(`/matching/autocomplete?keyword=${encodeURIComponent(keyword)}`)
                .then(res => res.json())
                .then(data => {
                    list.innerHTML = '';
                    if (data.length > 0) {
                        list.classList.add('show');
                    } else {
                        list.classList.remove('show');
                    }

                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.textContent = item.name;
                        div.onclick = () => {
                            input.value = item.name;
                            hidden.value = item.id;
                            list.innerHTML = '';
                            list.classList.remove('show');
                        };
                        list.appendChild(div);
                    });
                });
        });

        document.addEventListener('click', (e) => {
            if (!list.contains(e.target) && e.target !== input) {
                list.innerHTML = '';
                list.classList.remove('show');
            }
        });
    }

    // ===== 전체 보기 함수 =====
    function showAllDogs() {
        console.log('전체 강아지 로드 시작...');
        showLoading('전체 강아지 로딩 중...');

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

                // ✅ 수정: 로그인 상태이고 프로필이 선택된 경우만 필터링
                if (window.matchData?.isLoggedIn) {
                    const userDogsCount = window.matchData?.userDogs?.length || 0;
                    if (userDogsCount === 1 || (userDogsCount >= 2 && window.dogProfileManager?.getSelectedDogId())) {
                        filterDogsForCurrentProfile();
                    }
                }

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

    // ===== 검색 함수 =====
    function performSearch() {
        const gender = document.getElementById('genderFilter')?.value || '';
        const speciesId = document.getElementById('selectedSpeciesId')?.value || '';
        const city = document.getElementById('cityFilter')?.value || '';
        const county = document.getElementById('countyFilter')?.value || '';
        const town = document.getElementById('townFilter')?.value || '';
        const keyword1 = selectedKeywords.length > 0 ? selectedKeywords[0] : '';

        const params = new URLSearchParams();
        if (gender) params.append('ugender', gender);
        if (speciesId) params.append('speciesId', speciesId);
        if (city) params.append('city', city);
        if (county) params.append('county', county);
        if (town) params.append('town', town);
        if (keyword1) params.append('keyword1', keyword1);
        params.append('limit', '20');

        showLoading('검색 중...');

        fetch(`/matching/search?${params.toString()}`)
            .then(res => res.json())
            .then(dogs => {
                currentDogs = dogs || [];

                // ✅ 수정: 로그인 상태이고 프로필이 선택된 경우만 필터링
                if (window.matchData?.isLoggedIn) {
                    const userDogsCount = window.matchData?.userDogs?.length || 0;
                    if (userDogsCount === 1 || (userDogsCount >= 2 && window.dogProfileManager?.getSelectedDogId())) {
                        filterDogsForCurrentProfile();
                    }
                }

                renderCards();
                hideLoading();

                if (currentDogs.length === 0) {
                    showNotification('검색 결과가 없습니다.', 'info');
                } else {
                    showNotification(`${currentDogs.length}마리를 찾았습니다!`, 'success');
                }
            })
            .catch(error => {
                console.error('검색 실패:', error);
                showNotification('검색 중 오류가 발생했습니다.', 'error');
                hideLoading();
            });
    }

    // ===== 카드 렌더링 함수 (스와이퍼용) - 수정된 버전 =====
    function renderCards() {
        console.log('=== 스와이퍼 카드 렌더링 시작 ===');
        console.log('currentDogs:', currentDogs.map(d => d.dname));
        console.log('카드 수:', currentDogs.length);

        if (!swiper) {
            console.error('스와이퍼가 초기화되지 않았습니다.');
            return;
        }

        // 기존 슬라이드 모두 제거
        swiper.removeAllSlides();

        if (currentDogs.length === 0) {
            showEmptyState();
            return;
        }

        // ✅ 수정: 카드 개수에 따라 스와이퍼 설정 변경
        updateSwiperConfig(currentDogs.length);

        // ✅ 수정: 원본 데이터만 사용 (중복 생성하지 않음)
        const dogsToRender = [...currentDogs];

        // 각 강아지마다 슬라이드 생성
        dogsToRender.forEach((dog, index) => {
            const slideElement = createDogSlide(dog, index);
            swiper.appendSlide(slideElement);
        });

        // 스와이퍼 업데이트
        swiper.update();

        console.log('=== 스와이퍼 카드 렌더링 완료 ===');
    }

    // ✅ 새로 추가: 카드 개수에 따른 스와이퍼 설정 업데이트
    function updateSwiperConfig(cardCount) {
        if (!swiper) return;

        console.log('스와이퍼 설정 업데이트 - 카드 수:', cardCount);

        // 카드 개수에 따라 루프 및 슬라이드 수 설정
        if (cardCount >= 3) {
            // 3개 이상이면 루프 활성화 및 3개 표시
            swiper.params.loop = true;
            swiper.params.slidesPerView = 3;
            swiper.loopDestroy();
            swiper.loopCreate();
        } else if (cardCount === 2) {
            // 2개면 루프 비활성화 및 2개 표시
            swiper.params.loop = false;
            swiper.params.slidesPerView = 2;
            swiper.loopDestroy();
        } else if (cardCount === 1) {
            // 1개면 루프 비활성화 및 1개 표시
            swiper.params.loop = false;
            swiper.params.slidesPerView = 1;
            swiper.loopDestroy();
        }

        // 반응형 설정도 업데이트
        swiper.params.breakpoints = {
            480: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: cardCount >= 2 ? Math.min(2, cardCount) : 1,
                spaceBetween: 25,
            },
            1200: {
                slidesPerView: cardCount >= 3 ? 3 : cardCount,
                spaceBetween: 30,
            }
        };

        console.log('스와이퍼 설정 완료 - 루프:', swiper.params.loop, '슬라이드 수:', swiper.params.slidesPerView);
    }

    // ===== 스와이퍼 슬라이드 생성 함수 =====
    function createDogSlide(dog, index) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'swiper-slide';

        const card = createDogCard(dog);
        slideDiv.appendChild(card);

        return slideDiv;
    }

    // ===== ✅ 수정: 카드 생성 함수 (하트 상태 확인 개선) =====
    function createDogCard(dog) {
        const card = document.createElement('div');
        card.className = 'dog-card';
        card.dataset.dogId = dog.dno;

        // ✅ 키워드1만 처리 (키워드2 제거)
        let keywordTags = '';
        if (dog.keywords1 && dog.keywords1.length > 0) {
            keywordTags = dog.keywords1.map(keyword =>
                `<span class="keyword-tag">${keyword.dktag}</span>`
            ).join('');
        }

        // ✅ 수정: 이미지 처리 로직 개선
        let imageUrl = null;
        let imageClass = 'card-image';
        let imageContent = '';
        let useBackgroundImage = false;

        // 이미지 URL 확인
        if (dog.image && dog.image.diurl && dog.image.diurl.trim() !== '') {
            imageUrl = dog.image.diurl;
            useBackgroundImage = true;
        } else {
            // ✅ 수정: 이미지가 없으면 이름 첫 글자 표시
            imageClass = 'card-image default-bg';
            imageContent = dog.dname && dog.dname.length > 0 ? dog.dname.charAt(0).toUpperCase() : '🐕';
            useBackgroundImage = false;
        }

        // 주소 표시
        const location = dog.owner?.address?.fullAddress || '위치 미공개';

        // 로그인 여부
        const isLoggedIn = window.matchData && window.matchData.isLoggedIn;

        // ✅ 수정: 현재 선택된 강아지의 좋아요 상태 확인 개선
        let myDogId = null;
        let isAlreadyLiked = false;

        if (isLoggedIn) {
            const userDogsCount = window.matchData?.userDogs?.length || 0;
            if (userDogsCount === 1) {
                myDogId = window.matchData.userDogs[0].dno;
            } else if (userDogsCount >= 2) {
                myDogId = window.dogProfileManager?.getSelectedDogId();
            }

            // ✅ 수정: 현재 선택된 강아지의 개별 localStorage 확인
            if (myDogId) {
                const liked = JSON.parse(localStorage.getItem(`likedByDog_${myDogId}`) || '[]');
                isAlreadyLiked = liked.includes(dog.dno);
            }
        }

        console.log(`강아지 ${dog.dname} 카드 생성 - 내 강아지 ID: ${myDogId}, 이미 좋아요: ${isAlreadyLiked}`);

        // ✅ 수정: 하트 SVG 색상 동적 설정
        const heartFill = isAlreadyLiked ? '#FF69B4' : '#F5F6F8';
        const heartStroke = isAlreadyLiked ? '#FF1493' : 'white';

        // ✅ HOME과 동일한 하트 SVG 사용 (색상 동적 적용)
        const heartSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="22.903" height="20.232" viewBox="0 0 22.903 20.232">
                <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06a5.5,5.5,0,0,0,0-7.78Z"
                      transform="translate(-1.549 -2.998)" 
                      fill="${heartFill}" 
                      stroke="${heartStroke}" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2"/>
            </svg>
        `;

        // ✅ 수정: 카드 HTML 생성 (이미지 처리 개선)
        let cardImageHtml = '';
        if (useBackgroundImage) {
            // 실제 이미지 사용
            cardImageHtml = `<div class="${imageClass}" style="background-image: url('${imageUrl}')">`;
        } else {
            // 기본 이미지 (첫 글자 표시)
            cardImageHtml = `<div class="${imageClass}">${imageContent}`;
        }

        card.innerHTML = `
            ${cardImageHtml}
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="dog-name">${dog.dname}</h3>
                        ${isLoggedIn ? `
                        <button class="heart-btn ${isAlreadyLiked ? 'liked disabled' : ''}" data-dog-id="${dog.dno}">
                            ${heartSvg}
                        </button>
                        ` : `
                        <button class="heart-btn disabled" title="좋아요는 회원만 가능합니다">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22.903" height="20.232" viewBox="0 0 22.903 20.232">
                                <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06a5.5,5.5,0,0,0,0-7.78Z" transform="translate(-1.549 -2.998)" fill="#B7B7B7" stroke="#B7B7B7" stroke-width="2"/>
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

        // 하트 버튼 이벤트 추가 (로그인한 경우만)
        const heartBtn = card.querySelector('.heart-btn');
        if (heartBtn && isLoggedIn && !isAlreadyLiked) {
            heartBtn.addEventListener('click', handleHeartClick);
        } else if (heartBtn && !isLoggedIn) {
            // ✅ 비회원일 때 하트 클릭 시 로그인 프롬프트
            heartBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showGuestLikePrompt();
            });
        }

        return card;
    }

    // ===== 매칭 모달 표시 =====
    function showMatchModal(dogId) {
        console.log('매칭 모달 표시 시작, dogId:', dogId);

        const matchedDog = currentDogs.find(dog => dog.dno === dogId);
        if (!matchedDog) {
            console.error('매칭된 강아지를 찾을 수 없음:', dogId);
            return;
        }

        console.log('매칭된 강아지:', matchedDog.dname);

        const modalTitle = document.getElementById('modalTitle');
        const myDogImage = document.getElementById('myDogImage');
        const myDogName = document.getElementById('myDogName');
        const friendDogImage = document.getElementById('friendDogImage');
        const friendDogName = document.getElementById('friendDogName');
        const modalMessage = document.getElementById('modalMessage');

        // 모달 내용 설정
        if (modalTitle) modalTitle.textContent = '🎉 매칭 성사!';
        if (friendDogImage) {
            friendDogImage.src = matchedDog.image?.diurl || '/img/default-dog.png';
            friendDogImage.alt = matchedDog.dname;
        }
        if (friendDogName) friendDogName.textContent = matchedDog.dname;
        if (modalMessage) modalMessage.textContent = `${matchedDog.dname}와 친구가 되었어요!`;

        // 내 강아지 정보 설정
        const userDogsCount = window.matchData?.userDogs?.length || 0;
        let myDog = null;

        if (userDogsCount === 1) {
            myDog = window.matchData.userDogs[0];
        } else if (userDogsCount >= 2) {
            const selectedDogId = window.dogProfileManager?.getSelectedDogId();
            myDog = window.matchData.userDogs.find(dog => dog.dno === selectedDogId);
        }

        if (myDog) {
            if (myDogImage) {
                myDogImage.src = myDog.image?.diurl || '/img/default-dog.png';
                myDogImage.alt = myDog.dname;
            }
            if (myDogName) myDogName.textContent = myDog.dname;
            console.log('내 강아지 정보 설정:', myDog.dname);
        }

        // 모달 표시
        if (matchModal) {
            console.log('모달 표시 중...');
            matchModal.classList.add('show');

            // 매칭 성사 시에는 강아지를 목록에서 즉시 제거
            setTimeout(() => {
                removeCurrentDogFromView(dogId);
            }, 2000);
        } else {
            console.error('matchModal 엘리먼트를 찾을 수 없음');
        }
    }

    // ===== 현재 뷰에서 강아지 제거 =====
    function removeCurrentDogFromView(dogId) {
        const dogIndex = currentDogs.findIndex(dog => dog.dno === dogId);
        if (dogIndex !== -1) {
            currentDogs.splice(dogIndex, 1);

            // 스와이퍼에서 해당 슬라이드 제거 후 재렌더링
            if (swiper) {
                renderCards(); // 전체 재렌더링
            }

            console.log(`강아지 ID ${dogId} 제거 완료, 남은 강아지: ${currentDogs.length}마리`);
        }
    }

    // ===== 빈 상태 표시 =====
    function showEmptyState() {
        if (!swiper) return;

        // 모든 슬라이드 제거
        swiper.removeAllSlides();

        // 빈 상태 슬라이드 추가
        const emptySlide = document.createElement('div');
        emptySlide.className = 'swiper-slide';
        emptySlide.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🐕</div>
                <h3>더 이상 새로운 친구가 없어요</h3>
                <p>필터를 조정하거나 나중에 다시 확인해보세요!</p>
                <button onclick="location.reload()" class="action-btn primary">새로고침</button>
            </div>
        `;

        swiper.appendSlide(emptySlide);
        swiper.update();
    }

    // ===== 필터 초기화 =====
    function resetFilters() {
        console.log('필터 초기화');

        selectedKeywords = [];
        document.querySelectorAll('.keyword-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        updateKeywordCounter();

        const genderFilter = document.getElementById('genderFilter');
        const speciesInput = document.getElementById('speciesInput');
        const cityFilter = document.getElementById('cityFilter');
        const countyFilter = document.getElementById('countyFilter');
        const townFilter = document.getElementById('townFilter');

        if (genderFilter) genderFilter.value = '';
        if (speciesInput) speciesInput.value = '';
        if (cityFilter) cityFilter.value = '';
        if (countyFilter) {
            countyFilter.value = '';
            countyFilter.disabled = true;
        }
        if (townFilter) {
            townFilter.value = '';
            townFilter.disabled = true;
        }

        showAllDogs();
    }

    // ===== 키워드 카운터 업데이트 =====
    function updateKeywordCounter() {
        if (selectedCountSpan) {
            selectedCountSpan.textContent = selectedKeywords.length;
        }
    }

    // ===== 모달 닫기 =====
    function closeModal() {
        if (matchModal) {
            matchModal.classList.remove('show');
        }
    }

    // ===== 친구 목록으로 이동 =====
    function openFriendsList() {
        const userDogsCount = window.matchData?.userDogs?.length || 0;
        let myDogId = null;

        if (userDogsCount === 1) {
            myDogId = window.matchData.userDogs[0].dno;
        } else if (userDogsCount >= 2) {
            myDogId = window.dogProfileManager?.getSelectedDogId();
        }

        showNotification('친구 목록으로 이동합니다!', 'success');

        setTimeout(() => {
            window.location.href = `/dog-friends/list${myDogId ? '?dogId=' + myDogId : ''}`;
        }, 1000);

        closeModal();
    }

    // ===== ✅ 수정: 로딩 표시/숨김 (메시지 추가) =====
    function showLoading(message = '로딩 중...') {
        if (loadingSpinner) {
            const loadingText = loadingSpinner.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            loadingSpinner.classList.remove('hidden');
        }
    }

    function hideLoading() {
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    }

    // ===== ✅ 수정: 비회원 좋아요 클릭 시 프롬프트 (CSS 클래스 사용) =====
    function showGuestLikePrompt() {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.login-prompt-modal');
        if (existingModal) {
            existingModal.remove();
        }

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

        document.body.appendChild(guestModal);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (guestModal.parentNode) {
                guestModal.remove();
            }
        }, 5000);
    }

    // ===== 알림 표시 =====
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

    // ===== 초기화 실행 =====
    init();
});