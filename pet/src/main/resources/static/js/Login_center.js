// 모달 데이터 리셋 (현재 HTML ID에 맞춤)
function resetModalData() {
    selectedSize = '';
    selectedKeywords = [];
    uploadedImage = null;

    // 폼 리셋 - 현재 HTML의 ID들로 수정
    const dogName = document.getElementById('dogName');
    const dogGender = document.getElementById('dogGender');
    const dogSurgery = document.getElementById('dogSurgery');
    const dogBreed = document.getElementById('dogBreed');
    const birthYear = document.getElementById('birthYear');
    const birthMonth = document.getElementById('birthMonth');
    const birthDay = document.getElementById('birthDay');
    const dogIntroduction = document.getElementById('dogIntroduction');

    if (dogName) dogName.value = '';
    if (dogGender) dogGender.value = '';
    if (dogSurgery) dogSurgery.value = '';
    if (dogBreed) dogBreed.value = '';
    if (birthYear) birthYear.value = '';
    if (birthMonth) birthMonth.value = '';
    if (birthDay) birthDay.value = '';
    if (dogIntroduction) dogIntroduction.value = '';

    // 크기 카드 선택 해제
    document.querySelectorAll('.size_card').forEach(card => {
        card.classList.remove('selected');
    });

    // 키워드 선택 해제
    document.querySelectorAll('.keyword_btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // 업로드 영역 리셋 - 현재 HTML ID로 수정
    const uploadArea = document.getElementById('imageUploadArea');
    if (uploadArea) {
        uploadArea.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="29.015" height="29" viewBox="0 0 29.015 29">
                    <path id="upload-image" d="M25.482,17.573A1.381,1.381,0,0,0,24.1,18.955v.525l-2.044-2.044a3.854,3.854,0,0,0-5.428,0l-.967.967-3.426-3.426a3.937,3.937,0,0,0-5.428,0L4.763,17.021V9.286A1.381,1.381,0,0,1,6.144,7.9h9.669a1.381,1.381,0,0,0,0-2.763H6.144A4.144,4.144,0,0,0,2,9.286V25.861A4.144,4.144,0,0,0,6.144,30H22.719a4.144,4.144,0,0,0,4.144-4.144V18.955A1.381,1.381,0,0,0,25.482,17.573ZM6.144,27.242a1.381,1.381,0,0,1-1.381-1.381V20.93l4.006-4.006a1.091,1.091,0,0,1,1.506,0L14.652,21.3h0l5.939,5.939ZM24.1,25.861a1.229,1.229,0,0,1-.249.732l-6.23-6.257.967-.967a1.064,1.064,0,0,1,1.519,0l3.992,4.02ZM30.606,5.542,26.462,1.4a1.428,1.428,0,0,0-1.961,0L20.357,5.542A1.387,1.387,0,0,0,22.319,7.5l1.782-1.8V13.43a1.381,1.381,0,1,0,2.763,0V5.708l1.782,1.8a1.387,1.387,0,1,0,1.961-1.961Z" transform="translate(-2 -1.005)" fill="#b7b7b7"/>
                </svg>
                <p>강아지 사진 올리기</p>
            `;
        uploadArea.classList.remove('has_image');
    }

    // 파일 입력 리셋
    const fileInput = document.getElementById('dogImageInput');
    if (fileInput) {
        fileInput.value = '';
    }

    // 버튼 상태 업데이트
    updateButtonStates();
}document.addEventListener('DOMContentLoaded', function() {
    console.log('Login_center.js 로드 완료');

    // 실제 친구 데이터를 저장할 변수
    let favoriteFriends = [];
    let selectedMainDogId = null;

    // 모달 관련 변수들
    let currentStep = 1;
    let selectedSize = '';
    let selectedKeywords = [];
    let uploadedImage = null;
    let modalInitialized = false;

    // 선택된 메인 강아지 ID 가져오기
    function getSelectedMainDogId() {
        // 1. 매칭에서 설정한 값 확인
        const matchSelected = localStorage.getItem('selectedMainDogId');
        if (matchSelected) {
            return parseInt(matchSelected);
        }

        // 2. 전역 변수 확인
        if (window.selectedMainDogId) {
            return parseInt(window.selectedMainDogId);
        }

        // 3. 첫 번째 강아지를 기본값으로
        if (window.dogsData && window.dogsData.length > 0) {
            return window.dogsData[0].dno;
        }

        return null;
    }

    // 프로필 순서 재배치 및 선택 표시
    function updateProfileOrder() {
        const selectedDogId = getSelectedMainDogId();
        if (!selectedDogId || !window.dogsData || window.dogsData.length === 0) {
            return;
        }

        console.log('선택된 강아지 ID:', selectedDogId);

        // 강아지 데이터 재정렬 (선택된 강아지를 맨 앞으로)
        const selectedDog = window.dogsData.find(dog => dog.dno === selectedDogId);
        if (!selectedDog) {
            console.log('선택된 강아지를 찾을 수 없음');
            return;
        }

        // 선택된 강아지를 제외한 나머지 강아지들
        const otherDogs = window.dogsData.filter(dog => dog.dno !== selectedDogId);

        // 재정렬된 순서
        const reorderedDogs = [selectedDog, ...otherDogs];

        // 프로필 그리드 다시 렌더링
        renderProfileGrid(reorderedDogs, selectedDogId);

        // 즐겨찾기 타이틀 업데이트
        updateFavoritesTitle(selectedDog.dname);

        console.log('프로필 순서 업데이트 완료:', selectedDog.dname);
    }

    // 프로필 그리드 렌더링
    function renderProfileGrid(dogs, selectedDogId) {
        const profilesGrid = document.querySelector('.profiles_grid');
        if (!profilesGrid) return;

        profilesGrid.innerHTML = '';

        dogs.forEach(dog => {
            const profileItem = document.createElement('div');
            profileItem.className = 'profile_item';
            profileItem.dataset.dogId = dog.dno;

            // 선택된 강아지인지 확인
            if (dog.dno === selectedDogId) {
                profileItem.classList.add('selected');
            }

            // 이미지 처리
            let imageHtml;
            if (dog.image && dog.image.diurl) {
                imageHtml = `<img src="${dog.image.diurl}" alt="${dog.dname} 프로필 이미지">`;
            } else {
                const firstLetter = dog.dname.charAt(0);
                imageHtml = `<span>${firstLetter}</span>`;
            }

            profileItem.innerHTML = `
                <div class="profile_image ${!dog.image || !dog.image.diurl ? 'profile_initial' : ''}">
                    ${imageHtml}
                </div>
                <div class="profile_name">${dog.dname}</div>
            `;

            // 클릭 이벤트 추가
            profileItem.addEventListener('click', function() {
                selectDog(dog.dno);
            });

            profilesGrid.appendChild(profileItem);
        });
    }

    // 강아지 선택 처리
    function selectDog(dogId) {
        console.log('강아지 선택됨:', dogId);

        // 로컬 스토리지에 저장
        localStorage.setItem('selectedMainDogId', dogId);
        window.selectedMainDogId = dogId;
        selectedMainDogId = dogId;

        // 프로필 순서 업데이트
        updateProfileOrder();

        // 친구 목록 다시 로드 (선택된 강아지 기준으로)
        loadFavoriteFriends();

        // 선택 알림
        const selectedDog = window.dogsData.find(dog => dog.dno === dogId);
        if (selectedDog) {
            showStatusNotification(`${selectedDog.dname}(으)로 프로필이 변경되었습니다.`, 'success');
        }
    }

    // 즐겨찾기 타이틀 업데이트
    function updateFavoritesTitle(dogName) {
        const favoritesTitle = document.querySelector('.favorites-title');
        if (favoritesTitle) {
            favoritesTitle.innerHTML = `<span class="selected-dog-name">${dogName}</span>의 친한 친구`;
        }
    }

    // 강아지 상태 변경 이벤트 설정
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

    // 강아지 상태 업데이트 API 호출
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

    // 상태 변경 알림 표시
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

    // ===== 모달 시스템 시작 =====

    // 모달 HTML 생성 함수 (현재 HTML 구조에 맞춤)
    function createModalHTML() {
        return `
            <div id="profileModal" class="profile_modal">
                <div class="profile_modal_content">
                    <!-- 1단계: 강아지 크기 선택 -->
                    <div id="step1" class="modal_step active">
                        <h2>우리 강아지 <span class="highlight">크기</span> 선택하기</h2>
                        <div class="dog_size_cards">
                            <div class="size_card" data-size="large">
                                <img src="/static/img/대형견.png" alt="대형견" class="size_image">
                                <div class="size_info">
                                    <h3>대형견</h3>
                                    <p>25kg, 60cm 이상</p>
                                    <span class="size_breeds">리트리버, 셰퍼드, 도베르만 등등</span>
                                </div>
                            </div>
                            <div class="size_card" data-size="medium">
                                <img src="/static/img/중형견.png" alt="중형견" class="size_image">
                                <div class="size_info">
                                    <h3>중형견</h3>
                                    <p>10kg ~ 25kg<br>35cm ~ 60cm</p>
                                    <span class="size_breeds">시바견, 비글, 웰시코기 등</span>
                                </div>
                            </div>
                            <div class="size_card" data-size="small">
                                <img src="/static/img/소형견.png" alt="소형견" class="size_image">
                                <div class="size_info">
                                    <h3>소형견</h3>
                                    <p>10kg, 35cm 이하</p>
                                    <span class="size_breeds">포메, 치와와, 푸들, 말티즈 등</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal_buttons">
                            <button class="modal_btn secondary" onclick="closeProfileModal()">이전</button>
                            <button class="modal_btn primary" id="nextStep1" disabled>다음</button>
                        </div>
                    </div>

                    <!-- 2단계: 강아지 정보 입력 -->
                    <div id="step2" class="modal_step">
                        <div class="dog_form_container">
                            <div class="dog_image_upload">
                                <div class="upload_area" id="imageUploadArea">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="29.015" height="29" viewBox="0 0 29.015 29">
                                        <path id="upload-image" d="M25.482,17.573A1.381,1.381,0,0,0,24.1,18.955v.525l-2.044-2.044a3.854,3.854,0,0,0-5.428,0l-.967.967-3.426-3.426a3.937,3.937,0,0,0-5.428,0L4.763,17.021V9.286A1.381,1.381,0,0,1,6.144,7.9h9.669a1.381,1.381,0,0,0,0-2.763H6.144A4.144,4.144,0,0,0,2,9.286V25.861A4.144,4.144,0,0,0,6.144,30H22.719a4.144,4.144,0,0,0,4.144-4.144V18.955A1.381,1.381,0,0,0,25.482,17.573ZM6.144,27.242a1.381,1.381,0,0,1-1.381-1.381V20.93l4.006-4.006a1.091,1.091,0,0,1,1.506,0L14.652,21.3h0l5.939,5.939ZM24.1,25.861a1.229,1.229,0,0,1-.249.732l-6.23-6.257.967-.967a1.064,1.064,0,0,1,1.519,0l3.992,4.02ZM30.606,5.542,26.462,1.4a1.428,1.428,0,0,0-1.961,0L20.357,5.542A1.387,1.387,0,0,0,22.319,7.5l1.782-1.8V13.43a1.381,1.381,0,1,0,2.763,0V5.708l1.782,1.8a1.387,1.387,0,1,0,1.961-1.961Z" transform="translate(-2 -1.005)" fill="#b7b7b7"/>
                                    </svg>
                                    <p>강아지 사진 올리기</p>
                                </div>
                                <input type="file" id="dogImageInput" accept="image/*" style="display: none;">
                            </div>
                            <div class="dog_form">
                                <div class="form_row">
                                    <div class="form_group">
                                        <label>Dog Name</label>
                                        <input type="text" id="dogName" placeholder="강아지 이름">
                                    </div>
                                    <div class="form_group">
                                        <label>Gender</label>
                                        <select id="dogGender">
                                            <option value="">성별</option>
                                            <option value="male">수컷</option>
                                            <option value="female">암컷</option>
                                        </select>
                                    </div>
                                    <div class="form_group">
                                        <label for="dogSurgery">Surgery</label>
                                        <select id="dogSurgery" class="form-control">
                                            <option value="" disabled selected>중성화</option>
                                            <option value="yes">중성화 O</option>
                                            <option value="no">중성화 X</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form_row">
                                    <div class="form_group full">
                                        <label>Dog Type</label>
                                        <div class="breed_search">
                                            <input type="text" id="dogBreed" placeholder="견종 검색 하기">
                                            <button type="button" class="search_btn">검색</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_row_birt">
                                    <label>Dog Birthday</label>
                                    <div class="birthday_group">
                                        <select id="birthYear">
                                            <option value="">생년</option>
                                        </select>
                                        <select id="birthMonth">
                                            <option value="">월</option>
                                        </select>
                                        <select id="birthDay">
                                            <option value="">일</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form_group full">
                                    <label>Dog Introduction</label>
                                    <textarea id="dogIntroduction" placeholder="강아지 간단 소개 및 추가사항"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal_buttons">
                            <button class="modal_btn secondary" id="prevStep2">이전</button>
                            <button class="modal_btn primary" id="nextStep2" disabled>다음</button>
                        </div>
                    </div>

                    <!-- 3단계: 강아지 키워드 선택 -->
                    <div id="step3" class="modal_step">
                        <h2>강아지 키워드를 선택해주세요!</h2>
                        <p class="step_subtitle">중복 선택 가능</p>

                        <div class="keyword_grid">
                            <div class="keyword_category">
                                <button class="keyword_btn" data-keyword="외향">외향</button>
                                <button class="keyword_btn" data-keyword="내향">내향</button>
                                <button class="keyword_btn" data-keyword="활발한">활발한</button>
                                <button class="keyword_btn" data-keyword="친화력">친화력</button>
                                <button class="keyword_btn" data-keyword="순둥이">순둥이</button>
                                <button class="keyword_btn" data-keyword="짖어요">짖어요</button>
                            </div>
                            <div class="keyword_category">
                                <button class="keyword_btn" data-keyword="입질 있어요">입질 있어요</button>
                                <button class="keyword_btn" data-keyword="엄마 껌딱지 겁쟁이">엄마 껌딱지 겁쟁이</button>
                                <button class="keyword_btn" data-keyword="조심스러운 관찰형">조심스러운 관찰형</button>
                                <button class="keyword_btn" data-keyword="선긋는 외톨이 아생견">선긋는 외톨이 아생견</button>
                            </div>
                            <div class="keyword_category">
                                <button class="keyword_btn" data-keyword="초면에 신중, 구면엔 친근">초면에 신중, 구면엔 친근</button>
                                <button class="keyword_btn" data-keyword="동네 대장 일진형">동네 대장 일진형</button>
                                <button class="keyword_btn" data-keyword="까칠한 지킬 앤 하이드형">까칠한 지킬 앤 하이드형</button>
                                <button class="keyword_btn" data-keyword="신이 내린 반려 특화형">신이 내린 반려 특화형</button>
                            </div>
                            <div class="keyword_category">
                                <button class="keyword_btn" data-keyword="패닉에 빠진 극소심형">패닉에 빠진 극소심형</button>
                                <button class="keyword_btn" data-keyword="곱게자란 막둥이형">곱게자란 막둥이형</button>
                                <button class="keyword_btn" data-keyword="놀줄 아는 모범생형">놀줄 아는 모범생형</button>
                            </div>
                            <div class="keyword_category">
                                <button class="keyword_btn" data-keyword="모범견계의 엄친아형">모범견계의 엄친아형</button>
                                <button class="keyword_btn" data-keyword="쾌활한 만능엔터테이너형">쾌활한 만능엔터테이너형</button>
                            </div>
                            <div class="keyword_category">
                                <button class="keyword_btn" data-keyword="주인에 관심없는 나홀로 산다형">주인에 관심없는 나홀로 산다형</button>
                                <button class="keyword_btn" data-keyword="치고 빠지는 밀당 전재형">치고 빠지는 밀당 전재형</button>
                                <button class="keyword_btn" data-keyword="똥꼬발랄 핵인싸형">똥꼬발랄 핵인싸형</button>
                            </div>
                        </div>

                        <div class="modal_buttons">
                            <button class="modal_btn secondary" id="prevStep3">이전</button>
                            <button class="modal_btn primary" id="completeProfile">완료</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 모달 열기 함수
    function openProfileModal() {
        console.log('🚀 내장 모달 열기');

        // 모달이 이미 존재하는지 확인
        let modal = document.getElementById('profileModal');
        if (!modal) {
            // 모달 HTML을 body에 추가
            document.body.insertAdjacentHTML('beforeend', createModalHTML());
            modal = document.getElementById('profileModal');

            // 이벤트 리스너 설정
            setupModalEvents();

            // 생년월일 옵션 초기화
            initializeDateOptions();

            modalInitialized = true;
        }

        // 모달 표시
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // 첫 단계로 리셋
        resetToFirstStep();

        console.log('✅ 내장 모달 열림');
    }

    // 모달 닫기 함수
    function closeProfileModal() {
        console.log('🔒 내장 모달 닫기');
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetModalData();
        }
    }

    // 첫 단계로 리셋
    function resetToFirstStep() {
        currentStep = 1;
        showStep(1);
        resetModalData();
    }

    // 모달 데이터 리셋
    function resetModalData() {
        selectedSize = '';
        selectedKeywords = [];
        uploadedImage = null;

        // 폼 리셋
        const form = document.querySelector('.dog_form');
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'file') {
                    input.value = '';
                } else {
                    input.value = '';
                }
            });
        }

        // 크기 카드 선택 해제
        document.querySelectorAll('.size_card').forEach(card => {
            card.classList.remove('selected');
        });

        // 키워드 선택 해제
        document.querySelectorAll('.keyword_btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // 업로드 영역 리셋
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <svg class="upload_icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p>사진을 업로드해주세요</p>
            `;
            uploadArea.classList.remove('has_image');
        }

        // 버튼 상태 업데이트
        updateButtonStates();
    }

    // 단계 표시
    function showStep(step) {
        document.querySelectorAll('.modal_step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        const targetStep = document.getElementById(`step${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        currentStep = step;
    }

    // 생년월일 옵션 초기화
    function initializeDateOptions() {
        const yearSelect = document.getElementById('birthYear');
        const monthSelect = document.getElementById('birthMonth');
        const daySelect = document.getElementById('birthDay');

        if (yearSelect && yearSelect.children.length <= 1) {
            const currentYear = new Date().getFullYear();
            for (let i = currentYear; i >= currentYear - 20; i--) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                yearSelect.appendChild(option);
            }
        }

        if (monthSelect && monthSelect.children.length <= 1) {
            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                monthSelect.appendChild(option);
            }
        }

        if (daySelect && daySelect.children.length <= 1) {
            for (let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                daySelect.appendChild(option);
            }
        }
    }

    // 이벤트 리스너 설정 (현재 HTML ID에 맞춤)
    function setupModalEvents() {
        // 크기 카드 선택
        document.querySelectorAll('.size_card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.size_card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedSize = this.dataset.size;
                updateButtonStates();
            });
        });

        // 이미지 업로드 (ID 수정: imageUploadArea, dogImageInput)
        const uploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('dogImageInput');

        if (uploadArea && imageInput) {
            uploadArea.addEventListener('click', () => imageInput.click());
            imageInput.addEventListener('change', handleImageUpload);
        }

        // 키워드 선택
        document.querySelectorAll('.keyword_btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const keyword = this.dataset.keyword;
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    selectedKeywords = selectedKeywords.filter(k => k !== keyword);
                } else {
                    this.classList.add('selected');
                    selectedKeywords.push(keyword);
                    console.log('선택된 키워드:', selectedKeywords);
                }
            });
        });

        // 버튼 이벤트 (현재 HTML ID에 맞춤)
        const nextStep1 = document.getElementById('nextStep1');
        const prevStep2 = document.getElementById('prevStep2');
        const nextStep2 = document.getElementById('nextStep2');
        const prevStep3 = document.getElementById('prevStep3');
        const completeProfile = document.getElementById('completeProfile');

        if (nextStep1) nextStep1.addEventListener('click', () => showStep(2));
        if (prevStep2) prevStep2.addEventListener('click', () => showStep(1));
        if (nextStep2) nextStep2.addEventListener('click', () => {
            if (validateStep2()) showStep(3);
        });
        if (prevStep3) prevStep3.addEventListener('click', () => showStep(2));
        if (completeProfile) completeProfile.addEventListener('click', handleComplete);

        // 이름 입력 시 다음 버튼 활성화
        const dogNameInput = document.getElementById('dogName');
        if (dogNameInput) {
            dogNameInput.addEventListener('input', function() {
                const nextBtn = document.getElementById('nextStep2');
                if (nextBtn) {
                    nextBtn.disabled = this.value.trim() === '';
                }
            });
        }
    }

    // 이미지 업로드 처리
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const uploadArea = document.getElementById('uploadArea');
                uploadArea.innerHTML = `<img src="${e.target.result}" class="uploaded_image">`;
                uploadArea.classList.add('has_image');
                uploadedImage = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // 2단계 유효성 검사
    function validateStep2() {
        const dogName = document.getElementById('dogName').value.trim();
        if (!dogName) {
            alert('강아지 이름을 입력해주세요.');
            return false;
        }
        return true;
    }

    // 버튼 상태 업데이트
    function updateButtonStates() {
        const nextStep1Btn = document.getElementById('nextStep1');
        if (nextStep1Btn) {
            nextStep1Btn.disabled = !selectedSize;
        }
    }

    // 완료 처리 (현재 HTML 필드명에 맞춤)
    function handleComplete() {
        const formData = {
            size: selectedSize,
            name: document.getElementById('dogName').value,
            gender: document.getElementById('dogGender').value,
            surgery: document.getElementById('dogSurgery').value,
            breed: document.getElementById('dogBreed').value,
            birthYear: document.getElementById('birthYear').value,
            birthMonth: document.getElementById('birthMonth').value,
            birthDay: document.getElementById('birthDay').value,
            introduction: document.getElementById('dogIntroduction').value,
            keywords: selectedKeywords,
            image: uploadedImage
        };

        console.log('완료된 데이터:', formData);

        // 새 프로필 데이터 생성
        const newProfile = {
            dno: Date.now(),
            dname: formData.name,
            dgender: formData.gender,
            dtype: formData.breed,
            dintro: formData.introduction,
            keywords: formData.keywords,
            image: formData.image ? { diurl: formData.image } : null
        };

        // 새 프로필 추가 처리
        handleNewProfileAdded(newProfile);

        closeProfileModal();
        showStatusNotification('새로운 가족이 추가되었습니다! 🎉', 'success');
    }

    // 전역 함수로 즉시 노출
    window.openProfileModal = openProfileModal;
    window.closeProfileModal = closeProfileModal;

    // ===== 모달 시스템 끝 =====

    // ✅ 변경사항: addFamilyBtn 클릭 시 내장 모달 직접 호출
    const addFamilyBtn = document.getElementById('addFamilyBtn');
    if (addFamilyBtn) {
        addFamilyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('가족 추가 버튼 클릭됨');

            // 내장된 모달 함수 직접 호출
            openProfileModal();
        });
    }

    // ✅ 변경사항: 새 프로필 추가 처리 함수
    function handleNewProfileAdded(newProfileData) {
        console.log('새 프로필 추가됨:', newProfileData);

        // 새 프로필을 dogsData에 추가
        if (window.dogsData) {
            window.dogsData.push(newProfileData);
        }

        // 프로필 그리드 업데이트
        updateProfileOrder();

        // 성공 알림
        showStatusNotification(`${newProfileData.dname}이(가) 가족으로 추가되었습니다!`, 'success');
    }

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

    // 즐겨찾기 친구 목록 렌더링
    function renderFavoriteFriends() {
        const friendList = document.getElementById('friendList');
        if (!friendList) return;

        friendList.innerHTML = '';

        if (favoriteFriends.length === 0) {
            friendList.innerHTML = `
           <div class="empty-friends">
               <div class="empty-friends-icon">🐕</div>
               <div>아직 친구가 없어요!</div>
               <div>매칭에서 새로운 친구를 찾아보세요</div>
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

    // DOM 요소들
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

    // 페이지 로드 시 초기화
    function initializeProfileOrder() {
        // 로그인된 상태에서만 실행
        if (window.dogsData && window.dogsData.length > 0) {
            // 선택된 강아지 ID 확인
            selectedMainDogId = getSelectedMainDogId();

            if (selectedMainDogId) {
                console.log('초기 선택된 강아지 ID:', selectedMainDogId);
                updateProfileOrder();
            } else {
                // 기본적으로 첫 번째 강아지 선택
                if (window.dogsData.length > 0) {
                    selectDog(window.dogsData[0].dno);
                }
            }
        }
    }

    // 매칭에서 돌아왔을 때 프로필 업데이트 감지
    function setupProfileUpdateListener() {
        // localStorage 변경 감지 (다른 탭에서 변경된 경우)
        window.addEventListener('storage', function(e) {
            if (e.key === 'selectedMainDogId' && e.newValue) {
                console.log('다른 탭에서 강아지 선택 변경됨:', e.newValue);
                selectedMainDogId = parseInt(e.newValue);
                updateProfileOrder();
                loadFavoriteFriends();
            }
        });

        // 페이지 포커스 시 확인 (같은 탭에서 매칭 페이지 다녀온 경우)
        window.addEventListener('focus', function() {
            const currentSelected = getSelectedMainDogId();
            if (currentSelected && currentSelected !== selectedMainDogId) {
                console.log('페이지 포커스 시 강아지 선택 변경 감지:', currentSelected);
                selectedMainDogId = currentSelected;
                updateProfileOrder();
                loadFavoriteFriends();
            }
        });
    }

    // 초기 렌더링 및 이벤트 설정
    setupStatusChangeEvents();
    setupProfileUpdateListener();
    initializeProfileOrder();
    loadFavoriteFriends();

    console.log('Login_center.js 초기화 완료');

    // 매칭 페이지에서 호출할 수 있도록 전역 함수로 노출
    window.updateProfileOrderFromMatch = function(dogId) {
        if (dogId) {
            localStorage.setItem('selectedMainDogId', dogId);
            window.selectedMainDogId = dogId;
            selectedMainDogId = dogId;
            updateProfileOrder();
            loadFavoriteFriends();
        }
    };

    // 프로필 변경 이벤트 리스너 추가
    window.addEventListener('profileChanged', function(e) {
        const { dogId, dogName } = e.detail;
        console.log('프로필 변경 이벤트 수신:', dogName);

        selectedMainDogId = dogId;
        updateProfileOrder();
        loadFavoriteFriends();
    });

});
