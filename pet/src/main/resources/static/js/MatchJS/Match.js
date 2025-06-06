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

    // ===== 초기화 =====
    function init() {
        console.log('=== Match.js 초기화 시작 ===');

        setupKeywordEvents();
        setupEventListeners();
        setupProfileChangeListener();
        setupBreedAutocomplete();
        setupAddressDropdown();
        initializeSwiper();

        // ✅ 핵심 수정: 항상 매칭 데이터 표시
        handleInitialState();

        console.log('=== Match.js 초기화 완료 ===');
    }

    // ===== 스와이퍼 초기화 (무한 루프 적용) =====
    function initializeSwiper() {
        // 스와이퍼 초기화
        swiper = new Swiper(".mySwiper", {
            slidesPerView: 3, // ✅ 기본 3개 슬라이드 표시
            spaceBetween: 30,
            centeredSlides: true,
            loop: true, // ✅ 무한 루프 활성화
            loopAdditionalSlides: 2, // ✅ 추가 슬라이드로 부드러운 루프
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
                    slidesPerView: 3,
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

        console.log('스와이퍼 초기화 완료 (무한 루프 적용)');
    }

    // ===== 초기 상태 처리 (수정) =====
    function handleInitialState() {
        // ✅ 수정: 비회원이든 회원이든 항상 매칭 데이터 표시
        if (!window.matchData?.isLoggedIn) {
            // 비회원: 바로 데이터 로드
            console.log('비회원 - 바로 매칭 데이터 로드');
            loadInitialMatchingData();
            updateKeywordCounter();
            return;
        }

        // 로그인 상태 처리
        const hasSelection = window.dogProfileManager?.hasSelection();
        const userDogsCount = window.matchData?.userDogs?.length || 0;

        // ✅ 수정: 강아지 1마리만 있으면 바로 매칭 시작, 2마리 이상일 때만 선택 필요
        if (userDogsCount === 1) {
            // 1마리면 자동으로 해당 강아지로 매칭 시작
            console.log('강아지 1마리 - 자동 매칭 시작');
            loadInitialMatchingData();
        } else if (userDogsCount >= 2) {
            // 2마리 이상일 때만 프로필 선택 필요
            if (!hasSelection) {
                console.log('강아지 2마리 이상 - 프로필 선택 필요');
                showProfileSelectionGuide();
            } else {
                console.log('강아지 2마리 이상 - 선택된 프로필로 매칭 시작');
                loadInitialMatchingData();
            }
        } else {
            // 강아지가 없는 경우 - 매칭 데이터는 로드하되 알림 표시
            console.log('등록된 강아지 없음 - 기본 매칭 데이터 로드');
            loadInitialMatchingData();
            showNotification('강아지를 등록하시면 더 정확한 매칭이 가능해요!', 'info');
        }

        updateKeywordCounter();
    }

    // ===== 초기 매칭 데이터 로드 (AJAX) =====
    function loadInitialMatchingData() {
        console.log('초기 매칭 데이터 로드 시작...');
        showLoading();

        fetch('/matching/api/initial?limit=15')
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

                    // 현재 프로필에 맞게 필터링 (로그인된 경우만)
                    if (window.matchData?.isLoggedIn) {
                        filterDogsForCurrentProfile();
                    }

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

    // ===== 프로필 변경 리스너 =====
    function setupProfileChangeListener() {
        window.addEventListener('globalProfileChanged', function(e) {
            const { dogId, dogName } = e.detail;
            console.log('매칭페이지: 프로필 변경 감지:', dogName || '선택 해제');

            if (dogId) {
                // 프로필 선택됨
                showNotification(`${dogName}(으)로 매칭을 시작합니다!`, 'success');
                filterDogsForCurrentProfile();
                renderCards();
            } else {
                // 프로필 선택 해제됨 - 2마리 이상일 때만 가이드 표시
                const userDogsCount = window.matchData?.userDogs?.length || 0;
                if (userDogsCount >= 2) {
                    showProfileSelectionGuide();
                }
            }
        });
    }

    // ===== 핵심: 현재 프로필에 맞는 강아지 필터링 =====
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
            // 2마리 이상이면 선택된 강아지 ID 사용
            myDogId = window.dogProfileManager?.getSelectedDogId();
            if (!myDogId) {
                console.log('강아지 2마리 이상이지만 선택되지 않음');
                return;
            }
            console.log('선택된 강아지 ID:', myDogId);
        }

        console.log('현재 프로필용 강아지 필터링 시작, 메인 강아지 ID:', myDogId);

        // 1. 현재 강아지가 좋아요한 강아지들 (localStorage에서)
        const likedByCurrentDog = JSON.parse(localStorage.getItem(`likedByDog_${myDogId}`) || '[]');
        console.log('현재 강아지가 좋아요한 강아지 ID들:', likedByCurrentDog);

        // 2. 같은 유저(가족)의 강아지들 제외
        const myUserDogIds = window.matchData.userDogs ? window.matchData.userDogs.map(dog => dog.dno) : [];
        console.log('내 가족 강아지 ID들:', myUserDogIds);

        const beforeCount = currentDogs.length;

        currentDogs = currentDogs.filter(dog => {
            // 자기 자신과 가족 강아지들 제외
            if (myUserDogIds.includes(dog.dno)) {
                return false;
            }

            // 현재 강아지가 이미 좋아요한 강아지들 제외
            if (likedByCurrentDog.includes(dog.dno)) {
                return false;
            }

            return true;
        });

        const afterCount = currentDogs.length;
        console.log(`필터링 완료: ${beforeCount}마리 -> ${afterCount}마리`);
    }

    // ===== 핵심: 좋아요 처리 함수 =====
    function handleHeartClick(e) {
        e.stopPropagation();

        const dogId = parseInt(e.currentTarget.dataset.dogId);
        const heartBtn = e.currentTarget;

        // 비회원 체크
        if (!window.matchData || !window.matchData.isLoggedIn) {
            showGuestLikePrompt();
            return;
        }

        // ✅ 프로필 선택 체크 (수정)
        const userDogsCount = window.matchData?.userDogs?.length || 0;
        let myDogId;

        if (userDogsCount === 0) {
            showNotification('먼저 강아지를 등록해주세요!', 'error');
            return;
        } else if (userDogsCount === 1) {
            // 1마리면 자동으로 해당 강아지 사용
            myDogId = window.matchData.userDogs[0].dno;
        } else {
            // 2마리 이상이면 선택된 강아지 사용
            myDogId = window.dogProfileManager?.getSelectedDogId();
            if (!myDogId) {
                showProfileRequiredPrompt();
                return;
            }
        }

        // 중복 좋아요 체크
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
                    // localStorage에 좋아요한 강아지 ID 저장
                    liked.push(dogId);
                    localStorage.setItem(`likedByDog_${myDogId}`, JSON.stringify(liked));

                    // 하트 상태 변경
                    heartBtn.classList.add('liked');
                    heartBtn.classList.add('disabled');

                    const heartSvg = heartBtn.querySelector('svg');
                    if (heartSvg) {
                        heartSvg.style.fill = '#EDA9DD';
                        heartSvg.style.stroke = '#EDA9DD';
                    }

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

    // ===== 프로필 선택 필수 안내 모달 =====
    function showProfileRequiredPrompt() {
        const profileModal = document.createElement('div');
        profileModal.className = 'profile-required-modal';
        profileModal.innerHTML = `
            <div class="profile-required-content">
                <h3>🐕 강아지를 선택해주세요</h3>
                <p>매칭을 시작하려면 먼저 어떤 강아지로<br>매칭할지 선택해주세요!</p>
                <div class="profile-required-buttons">
                    <button class="profile-required-btn secondary" onclick="this.closest('.profile-required-modal').remove()">나중에</button>
                    <button class="profile-required-btn primary" onclick="focusProfileDropdown(); this.closest('.profile-required-modal').remove();">선택하기</button>
                </div>
            </div>
        `;

        profileModal.style.cssText = `
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

        document.body.appendChild(profileModal);

        // 3초 후 자동 제거
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

    // ===== 키워드 클릭 처리 =====
    function handleKeywordClick(e, keyword) {
        e.preventDefault();
        e.stopPropagation();

        if (!keyword) return;

        const btn = e.target;

        // 비회원은 선택 금지
        if (!window.matchData?.isLoggedIn) {
            showLoginPrompt();
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

    // ===== 키워드 자동 필터링 =====
    function autoFilterByKeywords() {
        if (selectedKeywords.length === 0) {
            showAllDogs();
            return;
        }

        console.log('키워드 자동 필터링 시작:', selectedKeywords);

        showLoading();

        const keywordParams = selectedKeywords.map(k => `keywords=${encodeURIComponent(k)}`).join('&');
        fetch(`/matching/search/keywords?${keywordParams}&limit=20`)
            .then(response => response.json())
            .then(dogs => {
                currentDogs = Array.isArray(dogs) ? dogs : [];

                if (window.matchData?.isLoggedIn) {
                    filterDogsForCurrentProfile();
                }
                renderCards();
                hideLoading();

                if (currentDogs.length === 0) {
                    showNotification('해당 키워드를 가진 친구가 없습니다.', 'info');
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

                // 현재 프로필에 맞게 필터링 (로그인된 경우만)
                if (window.matchData?.isLoggedIn) {
                    filterDogsForCurrentProfile();
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

        showLoading();

        fetch(`/matching/search?${params.toString()}`)
            .then(res => res.json())
            .then(dogs => {
                currentDogs = dogs || [];
                if (window.matchData?.isLoggedIn) {
                    filterDogsForCurrentProfile();
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

    // ===== 카드 렌더링 함수 (스와이퍼용) =====
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

        // ✅ 무한 루프를 위해 최소 3개 이상의 카드가 필요
        let dogsToRender = [...currentDogs];
        if (dogsToRender.length < 3) {
            // 카드가 3개 미만이면 복제해서 3개 이상 만들기
            while (dogsToRender.length < 3) {
                dogsToRender = [...dogsToRender, ...currentDogs];
            }
        }

        // 각 강아지마다 슬라이드 생성
        dogsToRender.forEach((dog, index) => {
            const slideElement = createDogSlide(dog, index);
            swiper.appendSlide(slideElement);
        });

        // 스와이퍼 업데이트
        swiper.update();

        console.log('=== 스와이퍼 카드 렌더링 완료 ===');
    }

    // ===== 스와이퍼 슬라이드 생성 함수 =====
    function createDogSlide(dog, index) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'swiper-slide';

        const card = createDogCard(dog);
        slideDiv.appendChild(card);

        return slideDiv;
    }

    // ===== 카드 생성 함수 (HOME 스타일 하트 적용) =====
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

        // 이미지 URL 안전 처리
        let imageUrl = '/img/default-dog.png';
        let imageClass = 'card-image';
        let imageContent = '';

        if (dog.image && typeof dog.image.diurl === 'string' && dog.image.diurl.trim() !== '') {
            imageUrl = dog.image.diurl;
        } else {
            // 기본 이미지 처리 (이름 첫 글자)
            imageClass = 'card-image default-bg';
            imageContent = dog.dname.charAt(0);
        }

        // 주소 표시
        const location = dog.owner?.address?.fullAddress || '위치 미공개';

        // 로그인 여부
        const isLoggedIn = window.matchData && window.matchData.isLoggedIn;

        // 좋아요 상태 확인
        let myDogId = null;
        if (isLoggedIn) {
            const userDogsCount = window.matchData?.userDogs?.length || 0;
            if (userDogsCount === 1) {
                myDogId = window.matchData.userDogs[0].dno;
            } else if (userDogsCount >= 2) {
                myDogId = window.dogProfileManager?.getSelectedDogId();
            }
        }

        const liked = myDogId ? JSON.parse(localStorage.getItem(`likedByDog_${myDogId}`) || '[]') : [];
        const isAlreadyLiked = liked.includes(dog.dno);

        // ✅ HOME과 동일한 하트 SVG 사용
        const heartSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="22.903" height="20.232" viewBox="0 0 22.903 20.232">
                <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06a5.5,5.5,0,0,0,0-7.78Z"
                      transform="translate(-1.549 -2.998)" 
                      fill="${isAlreadyLiked ? '#EDA9DD' : '#F5F6F8'}" 
                      stroke="white" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2"/>
            </svg>
        `;

        // 카드 HTML 생성
        if (imageContent) {
            // 기본 이미지 (첫 글자)
            card.innerHTML = `
                <div class="${imageClass}">
                    ${imageContent}
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
        } else {
            // 실제 이미지
            card.innerHTML = `
                <div class="${imageClass}" style="background-image: url('${imageUrl}')">
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
        }

        // 하트 버튼 이벤트 추가
        const heartBtn = card.querySelector('.heart-btn');
        if (heartBtn && !heartBtn.classList.contains('disabled')) {
            heartBtn.addEventListener('click', handleHeartClick);
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
                renderCards(); // 전체 재렌더링으로 무한 루프 유지
            }

            console.log(`강아지 ID ${dogId} 제거 완료, 남은 강아지: ${currentDogs.length}마리`);
        }
    }

    // ===== 프로필 선택 안내 (2마리 이상일 때만) =====
    function showProfileSelectionGuide() {
        if (!swiper) return;

        // 모든 슬라이드 제거
        swiper.removeAllSlides();

        // 안내 슬라이드 추가
        const guideSlide = document.createElement('div');
        guideSlide.className = 'swiper-slide';
        guideSlide.innerHTML = `
            <div class="profile-selection-guide">
                <div class="guide-icon">🐕</div>
                <h3>어떤 강아지로 매칭할까요?</h3>
                <p>위의 드롭다운에서 강아지를 선택하면<br>그 강아지의 매칭을 시작할 수 있어요!</p>
                <button onclick="focusProfileDropdown()" class="guide-btn">강아지 선택하기</button>
            </div>
        `;

        swiper.appendSlide(guideSlide);
        swiper.update();
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

    // ===== 로딩 표시/숨김 =====
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

    // ===== 비회원 좋아요 클릭 시 프롬프트 =====
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

    // ===== 로그인 프롬프트 표시 =====
    function showLoginPrompt() {
        const loginModal = document.createElement('div');
        loginModal.className = 'login-prompt-modal';
        loginModal.innerHTML = `
          <div class="login-prompt-content">
              <h3>🐕 더 많은 키워드 선택을 원하신다면?</h3>
              <p>로그인하시면 무제한으로 키워드를 선택할 수 있어요!</p>
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

.profile-required-content {
    background: white;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    max-width: 400px;
    width: 90%;
}

.profile-required-content h3 {
    font-size: 24px;
    color: #387FEB;
    margin-bottom: 15px;
}

.profile-required-content p {
    font-size: 16px;
    color: #666;
    margin-bottom: 30px;
    line-height: 1.5;
}

.profile-required-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.profile-required-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.profile-required-btn.primary {
    background: #387FEB;
    color: white;
}

.profile-required-btn.secondary {
    background: #f8f9fa;
    color: #495057;
    border: 2px solid #e9ecef;
}

.profile-required-btn:hover {
    transform: translateY(-2px);
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

.heart-btn.liked {
    opacity: 1;
}

.heart-btn.animate {
    animation: heartPulse 0.6s ease-in-out;
}

@keyframes heartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
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

/* 스와이퍼 슬라이드 내 카드 중앙 정렬 */
.swiper-slide {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
}

/* 반응형에서 카드 크기 조정 */
@media (max-width: 768px) {
    .swiper {
        padding: 10px 0 !important;
    }
}
`;
document.head.appendChild(style);