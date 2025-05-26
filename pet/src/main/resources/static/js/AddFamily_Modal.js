// AddFamily_Modal.js - 독립된 외부 모달 파일
console.log('AddFamily_Modal.js 로드됨');

// 모달 관련 변수들
let currentStep = 1;
let selectedSize = '';
let selectedKeywords = [];
let uploadedImage = null;


// 전역 함수로 노출 (HTML에서 호출하기 위해)
window.handleImageError = handleImageError;

// 모달 HTML 생성 함수
function createProfileModalHTML() {
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
    console.log('🚀 외부 모달 열기');

    // 모달이 이미 존재하는지 확인
    let modal = document.getElementById('profileModal');
    if (!modal) {
        // 모달 HTML을 body에 추가
        document.body.insertAdjacentHTML('beforeend', createProfileModalHTML());
        modal = document.getElementById('profileModal');

        // 이벤트 리스너 설정
        setupProfileModalEvents();

        // 생년월일 옵션 초기화
        initializeDateOptions();
    }

    // 모달 표시
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 첫 단계로 리셋
    resetToFirstStep();

    console.log('✅ 외부 모달 열림');
}

// 모달 닫기 함수
function closeProfileModal() {
    console.log('🔒 외부 모달 닫기');
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetProfileModalData();
    }
}

// 첫 단계로 리셋
function resetToFirstStep() {
    currentStep = 1;
    showProfileStep(1);
    resetProfileModalData();
}

// 단계 표시
function showProfileStep(step) {
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

// 이벤트 리스너 설정
function setupProfileModalEvents() {
    // 크기 카드 선택
    document.querySelectorAll('.size_card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.size_card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = this.dataset.size;
            updateProfileButtonStates();
        });
    });

    // 이미지 업로드
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('dogImageInput');

    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', handleProfileImageUpload);
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
            }
            console.log('선택된 키워드:', selectedKeywords);
        });
    });

    // 버튼 이벤트
    const nextStep1 = document.getElementById('nextStep1');
    const prevStep2 = document.getElementById('prevStep2');
    const nextStep2 = document.getElementById('nextStep2');
    const prevStep3 = document.getElementById('prevStep3');
    const completeProfile = document.getElementById('completeProfile');

    if (nextStep1) nextStep1.addEventListener('click', () => showProfileStep(2));
    if (prevStep2) prevStep2.addEventListener('click', () => showProfileStep(1));
    if (nextStep2) nextStep2.addEventListener('click', () => {
        if (validateProfileStep2()) showProfileStep(3);
    });
    if (prevStep3) prevStep3.addEventListener('click', () => showProfileStep(2));
    if (completeProfile) completeProfile.addEventListener('click', handleProfileComplete);

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
function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const uploadArea = document.getElementById('imageUploadArea');
            uploadArea.innerHTML = `<img src="${e.target.result}" class="uploaded_image">`;
            uploadArea.classList.add('has_image');
            uploadedImage = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 2단계 유효성 검사
function validateProfileStep2() {
    const dogName = document.getElementById('dogName').value.trim();
    if (!dogName) {
        alert('강아지 이름을 입력해주세요.');
        return false;
    }
    return true;
}

// 버튼 상태 업데이트
function updateProfileButtonStates() {
    const nextStep1Btn = document.getElementById('nextStep1');
    if (nextStep1Btn) {
        nextStep1Btn.disabled = !selectedSize;
    }
}

// 모달 데이터 리셋
function resetProfileModalData() {
    selectedSize = '';
    selectedKeywords = [];
    uploadedImage = null;

    // 폼 리셋
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

    // 업로드 영역 리셋
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
    updateProfileButtonStates();
}

// 완료 처리
function handleProfileComplete() {
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

    // Login_center.js의 함수 호출
    if (typeof window.handleNewProfileAdded === 'function') {
        window.handleNewProfileAdded(newProfile);
    }

    closeProfileModal();

    // 성공 알림 (Login_center.js 함수 사용)
    if (typeof window.showStatusNotification === 'function') {
        window.showStatusNotification('새로운 가족이 추가되었습니다! 🎉', 'success');
    } else {
        alert('새로운 가족이 추가되었습니다! 🎉');
    }
}

// 전역 함수로 노출
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;

console.log('✅ AddFamily_Modal.js 초기화 완료');