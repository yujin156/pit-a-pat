// AddFamily_Modal.js - 수정된 버전
console.log('AddFamily_Modal.js 로드됨');

// 모달 관련 변수들
let currentStep = 1;
let selectedSize = '';
let selectedKeywords = [];
let uploadedImage = null;

// 모달 HTML 생성 함수
function createProfileModalHTML() {
    // 이미지 경로를 변수로 정의
    const imagePaths = {
        large: "/img/large.png",
        medium: "/img/medium.png",
        small: "/img/small.png"
    };

    return `
        <div id="profileModal" class="profile_modal">
            <div class="profile_modal_content">
                <!-- 1단계: 강아지 크기 선택 -->
                <div id="step1" class="modal_step active">
                    <h2>우리 강아지 <span class="highlight">크기</span> 선택하기</h2>
                    <div class="dog_size_cards">
                        <!-- 대형견 카드 -->
                        <div class="size_card" data-size="large">
                            <img src="${imagePaths.large}" 
                                 alt="대형견" 
                                 class="size_image"
                                 onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                 onload="console.log('대형견 이미지 로딩 성공: ${imagePaths.large}');">
                            <div class="image_fallback" style="display:none;">
                                <span class="fallback_emoji">🐕</span>
                                <span class="fallback_text">대형견</span>
                            </div>
                            <div class="size_info">
                                <h3>대형견</h3>
                                <p>25kg, 60cm 이상</p>
                                <span class="size_breeds">리트리버, 셰퍼드, 도베르만 등등</span>
                            </div>
                        </div>
                        
                        <!-- 중형견 카드 -->
                        <div class="size_card" data-size="medium">
                            <img src="${imagePaths.medium}" 
                                 alt="중형견" 
                                 class="size_image"
                                 onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                 onload="console.log('중형견 이미지 로딩 성공: ${imagePaths.medium}');">
                            <div class="image_fallback" style="display:none;">
                                <span class="fallback_emoji">🐶</span>
                                <span class="fallback_text">중형견</span>
                            </div>
                            <div class="size_info">
                                <h3>중형견</h3>
                                <p>10kg ~ 25kg<br>35cm ~ 60cm</p>
                                <span class="size_breeds">시바견, 비글, 웰시코기 등</span>
                            </div>
                        </div>
                        
                        <!-- 소형견 카드 -->
                        <div class="size_card" data-size="small">
                            <img src="${imagePaths.small}" 
                                 alt="소형견" 
                                 class="size_image"
                                 onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                 onload="console.log('소형견 이미지 로딩 성공: ${imagePaths.small}');">
                            <div class="image_fallback" style="display:none;">
                                <span class="fallback_emoji">🐕‍🦺</span>
                                <span class="fallback_text">소형견</span>
                            </div>
                            <div class="size_info">
                                <h3>소형견</h3>
                                <p>10kg, 35cm 이하</p>
                                <span class="size_breeds">포메, 치와와, 푸들, 말티즈 등</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal_buttons">
                        <button class="modal_btn secondary" onclick="closeAddFamilyModal()">이전</button>
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

                    <div class="keyword_grid"></div>
<!--                        <div class="keyword_category">-->
<!--                            <button class="keyword_btn" data-keyword="외향">외향</button>-->
<!--                            <button class="keyword_btn" data-keyword="내향">내향</button>-->
<!--                            <button class="keyword_btn" data-keyword="활발한">활발한</button>-->
<!--                            <button class="keyword_btn" data-keyword="친화력">친화력</button>-->
<!--                            <button class="keyword_btn" data-keyword="순둥이">순둥이</button>-->
<!--                            <button class="keyword_btn" data-keyword="짖어요">짖어요</button>-->
<!--                        </div>-->
<!--                        <div class="keyword_category">-->
<!--                            <button class="keyword_btn" data-keyword="입질 있어요">입질 있어요</button>-->
<!--                            <button class="keyword_btn" data-keyword="엄마 껌딱지 겁쟁이">엄마 껌딱지 겁쟁이</button>-->
<!--                            <button class="keyword_btn" data-keyword="조심스러운 관찰형">조심스러운 관찰형</button>-->
<!--                            <button class="keyword_btn" data-keyword="선긋는 외톨이 아생견">선긋는 외톨이 아생견</button>-->
<!--                        </div>-->
<!--                        <div class="keyword_category">-->
<!--                            <button class="keyword_btn" data-keyword="초면에 신중, 구면엔 친근">초면에 신중, 구면엔 친근</button>-->
<!--                            <button class="keyword_btn" data-keyword="동네 대장 일진형">동네 대장 일진형</button>-->
<!--                            <button class="keyword_btn" data-keyword="까칠한 지킬 앤 하이드형">까칠한 지킬 앤 하이드형</button>-->
<!--                            <button class="keyword_btn" data-keyword="신이 내린 반려 특화형">신이 내린 반려 특화형</button>-->
<!--                        </div>-->
<!--                        <div class="keyword_category">-->
<!--                            <button class="keyword_btn" data-keyword="패닉에 빠진 극소심형">패닉에 빠진 극소심형</button>-->
<!--                            <button class="keyword_btn" data-keyword="곱게자란 막둥이형">곱게자란 막둥이형</button>-->
<!--                            <button class="keyword_btn" data-keyword="놀줄 아는 모범생형">놀줄 아는 모범생형</button>-->
<!--                        </div>-->
<!--                        <div class="keyword_category">-->
<!--                            <button class="keyword_btn" data-keyword="모범견계의 엄친아형">모범견계의 엄친아형</button>-->
<!--                            <button class="keyword_btn" data-keyword="쾌활한 만능엔터테이너형">쾌활한 만능엔터테이너형</button>-->
<!--                        </div>-->
<!--                        <div class="keyword_category">-->
<!--                            <button class="keyword_btn" data-keyword="주인에 관심없는 나홀로 산다형">주인에 관심없는 나홀로 산다형</button>-->
<!--                            <button class="keyword_btn" data-keyword="치고 빠지는 밀당 전재형">치고 빠지는 밀당 전재형</button>-->
<!--                            <button class="keyword_btn" data-keyword="똥꼬발랄 핵인싸형">똥꼬발랄 핵인싸형</button>-->
<!--                        </div>-->
<!--                    </div>-->
                    <div class="modal_buttons">
                        <button class="modal_btn secondary" id="prevStep3">이전</button>
                        <button class="modal_btn primary" id="completeProfile">완료</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ✅ 수정: showAddFamilyModal 함수 (Login_center.js에서 호출하는 함수)
function showAddFamilyModal() {
    console.log('🚀 AddFamily 모달 열기');

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

        loadKeywordsFromServer();

    }

    // 모달 표시
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 첫 단계로 리셋
    resetToFirstStep();

    console.log('✅ AddFamily 모달 열림');
}

// ✅ 수정: closeAddFamilyModal 함수 (Login_center.js에서 호출하는 함수)
function closeAddFamilyModal() {
    console.log('🔒 AddFamily 모달 닫기');
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

    // ✅ 견종 검색 버튼 클릭 이벤트 연결
    const breedInput = document.getElementById('dogBreed');
    const searchBtn = document.querySelector('.search_btn');

    if (searchBtn && breedInput) {
        console.log("🔗 검색 이벤트 연결됨");
        searchBtn.addEventListener('click', () => {
            const keyword = breedInput.value.trim();
            console.log("🔍 검색어:", keyword);

            if (!keyword) {
                alert("검색어를 입력하세요.");
                return;
            }

            fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`)
                .then(res => {
                    if (!res.ok) throw new Error('서버 오류: ' + res.status);
                    return res.json();
                })
                .then(data => {
                    if (!data || data.length === 0) {
                        alert("일치하는 견종이 없습니다.");
                        breedInput.dataset.speciesId = "";
                        return;
                    }

                    const matched = data[0];
                    breedInput.value = matched.name;
                    breedInput.dataset.speciesId = matched.id;
                    alert(`✅ 견종 선택됨: ${matched.name}`);
                })
                .catch(err => {
                    console.error("견종 검색 실패:", err);
                    alert("견종 검색 중 오류가 발생했습니다.");
                });
        });
    } else {
        console.warn("🚫 breedInput 또는 searchBtn이 존재하지 않습니다.");
    }

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
            uploadArea.innerHTML = `<img src="${e.target.result}" class="uploaded_image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`;
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

function handleProfileComplete() {
    function padZero(n) {
        return n < 10 ? '0' + n : n;
    }

    const year = document.getElementById('birthYear').value;
    const month = padZero(document.getElementById('birthMonth').value);
    const day = padZero(document.getElementById('birthDay').value);

    const birthday = `${year}-${month}-${day}`;
    const neuterValue = document.getElementById('dogSurgery').value;
    let neuterStatus = null;
    if (neuterValue === 'yes') {
        neuterStatus = 'NEUTERED';
    } else if (neuterValue === 'no') {
        neuterStatus = 'NOT_NEUTERED';
    } else {
        alert("❗ 중성화 여부를 선택해주세요.");
        return;
    }

    const dogRequest = {
        name: document.getElementById('dogName').value,
        gender: document.getElementById('dogGender').value.toUpperCase(),
        neuterStatus: neuterStatus,
        speciesId: document.getElementById('dogBreed').dataset.speciesId || '',
        birthday: birthday,
        intro: document.getElementById('dogIntroduction').value,
        size: selectedSize.toUpperCase(),
        keyword1Ids: selectedKeywords
    };

    const formData = new FormData();
    formData.append("dog", JSON.stringify(dogRequest));

    const imageInput = document.getElementById('dogImageInput');
    let imageUrl = "/img/default-dog-bg.svg";

    if (imageInput && imageInput.files[0]) {
        const filename = imageInput.files[0].name;
        formData.append("imageFile", imageInput.files[0]);
        imageUrl = "/img/uploads/" + filename;
    }

    fetch("/user/mypage/dog/register", {
        method: "POST",
        body: formData
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(text || "등록 실패");
                });
            }
            return res.text();
        })
        .then(message => {
            const newDog = {
                dname: dogRequest.name,
                size: dogRequest.size,
                diurl: imageUrl
            };

            if (typeof window.addDogProfile === 'function') {
                window.addDogProfile(newDog);
            }

            if (typeof showStatusNotification === "function") {
                showStatusNotification(message, 'success');
            } else {
                alert(message);
            }

            closeAddFamilyModal();
        })
        .catch(err => {
            const message = err.message || "알 수 없는 오류가 발생했습니다.";
            if (typeof showStatusNotification === "function") {
                showStatusNotification("❌ 등록 실패: " + message, 'error');
            } else {
                alert("❌ 등록 실패: " + message);
            }
        });
}

function loadKeywordsFromServer() {
    fetch('/dog/keyword')  // 🔥 컨트롤러 경로에 맞게 수정
        .then(res => res.json())
        .then(data => {
            const grid = document.querySelector('.keyword_grid');
            if (!grid || !data) return;

            grid.innerHTML = '';  // 기존 내용 제거

            const keywordsPerRow = 4;
            for (let i = 0; i < data.length; i += keywordsPerRow) {
                const rowDiv = document.createElement('div');
                rowDiv.classList.add('keyword_category');

                const rowItems = data.slice(i, i + keywordsPerRow);
                rowItems.forEach(keyword => {
                    const btn = document.createElement('button');
                    btn.classList.add('keyword_btn');
                    btn.setAttribute('data-keyword-id', keyword.id);
                    btn.textContent = keyword.name;

                    btn.addEventListener('click', function () {
                        const id = keyword.id;
                        if (this.classList.contains('selected')) {
                            this.classList.remove('selected');
                            selectedKeywords = selectedKeywords.filter(k => k !== id);
                        } else {
                            this.classList.add('selected');
                            selectedKeywords.push(id);
                        }
                        console.log('✅ 선택된 키워드 ID들:', selectedKeywords);
                    });

                    rowDiv.appendChild(btn);
                });

                grid.appendChild(rowDiv);
            }
        })
        .catch(err => {
            console.error("❌ 키워드 불러오기 실패:", err);
        });
}

// 견종 검색 기능 (컨트롤러 호출)
window.addEventListener('DOMContentLoaded', () => {
    const breedInput = document.getElementById('dogBreed');
    const searchBtn = document.querySelector('.search_btn');
    console.log("🐶 breedInput:", breedInput);
    console.log("🔍 searchBtn:", searchBtn);
    if (searchBtn && breedInput) {
        searchBtn.addEventListener('click', () => {
            const keyword = breedInput.value.trim();

            console.log("✅ [디버깅] 입력된 키워드:", keyword);

            if (!keyword) {
                alert("검색어를 입력하세요.");
                return;
            }

            const encodedKeyword = encodeURIComponent(keyword);
            console.log("✅ [디버깅] 인코딩된 키워드:", encodedKeyword);

            fetch(`/api/search?keyword=${encodedKeyword}`)
                .then(res => {
                    console.log("✅ [디버깅] fetch 응답 상태코드:", res.status);
                    return res.json();
                })
                .then(data => {
                    console.log("✅ [디버깅] 응답 데이터:", data);

                    if (!data || data.length === 0) {
                        alert("일치하는 견종이 없습니다.");
                        breedInput.dataset.speciesId = "";
                        return;
                    }

                    const matched = data[0];
                    console.log("✅ [디버깅] 첫 번째 매칭된 견종:", matched);

                    breedInput.value = matched.name;
                    breedInput.dataset.speciesId = matched.id;

                    alert(`✅ 견종 선택됨: ${matched.name}`);
                })
                .catch(err => {
                    console.error("❌ [에러] 견종 검색 실패:", err);
                    alert("견종 검색 중 오류가 발생했습니다.");
                });
        });


    }
});






// ✅ 전역 함수로 노출 (올바른 함수명으로 수정)
window.showAddFamilyModal = showAddFamilyModal;           // ✅ 이 함수가 Login_center.js에서 호출됨
window.closeAddFamilyModal = closeAddFamilyModal;         // ✅ 닫기 함수
window.createProfileModalHTML = createProfileModalHTML;   // ✅ HTML 생성 함수
window.resetAddFamilyModal = resetProfileModalData;       // ✅ 리셋 함수

console.log('✅ AddFamily_Modal.js 초기화 완료 - 노출된 함수들:');
console.log('- window.showAddFamilyModal:', typeof window.showAddFamilyModal);
console.log('- window.closeAddFamilyModal:', typeof window.closeAddFamilyModal);
console.log('- window.createProfileModalHTML:', typeof window.createProfileModalHTML);
if (typeof addDogProfile === 'function') {
    window.handleNewProfileAdded = addDogProfile;
}