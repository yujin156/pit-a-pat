// 전역 변수
let currentStep = 1;
const totalSteps = 5;
let dogImageIndex = 0;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register 시스템 초기화');
    initializeTermsCheckboxes();
    updateStep();
    startDogImageRotation();
});

// 강아지 이미지 자동 변경
function rotateDogImages() {
    const images = document.querySelectorAll('.dog_image');
    if (images.length > 0) {
        images[dogImageIndex].classList.remove('active');
        dogImageIndex = (dogImageIndex + 1) % images.length;
        images[dogImageIndex].classList.add('active');
    }
}

// 강아지 슬라이드 자동 시작
function startDogImageRotation() {
    setInterval(rotateDogImages, 3000);
}

// 약관 체크박스 초기화
function initializeTermsCheckboxes() {
    const allTerms = document.getElementById('terms_all');
    const individualTerms = ['terms_service', 'terms_privacy', 'terms_marketing'];

    // 전체 동의 체크박스 이벤트
    if (allTerms) {
        allTerms.addEventListener('change', function() {
            const isChecked = this.checked;

            individualTerms.forEach(termId => {
                const checkbox = document.getElementById(termId);
                if (checkbox) {
                    checkbox.checked = isChecked;
                }
            });

            updateButtonStates();
        });
    }

    // 개별 약관 체크박스 이벤트
    individualTerms.forEach(termId => {
        const checkbox = document.getElementById(termId);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                // 전체 동의 상태 확인
                const allChecked = individualTerms.every(id => {
                    const cb = document.getElementById(id);
                    return cb && cb.checked;
                });

                if (allTerms) {
                    allTerms.checked = allChecked;
                }

                updateButtonStates();
            });
        }
    });
}

// 필수 약관 체크 확인
function validateRequiredTerms() {
    const requiredTerms = ['terms_service', 'terms_privacy'];

    for (let termId of requiredTerms) {
        const checkbox = document.getElementById(termId);
        if (!checkbox || !checkbox.checked) {
            return false;
        }
    }
    return true;
}

// 스텝 업데이트
function updateStep() {
    // 콘텐츠 스텝 변경
    document.querySelectorAll('.content_step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`content_step${currentStep}`).classList.add('active');

    // 페이지네이션 업데이트
    document.querySelectorAll('.register_indication').forEach((indicator, index) => {
        indicator.classList.remove('indication_active');
        if (index < currentStep) {
            indicator.classList.add('indication_active');
        }
    });

    // 선 업데이트
    document.querySelectorAll('.indication_line').forEach((line, index) => {
        line.classList.remove('active');
        if (index < currentStep - 1) {
            line.classList.add('active');
        }
    });

    // 스텝단계마다 굵은 글씨로 변경
    document.querySelectorAll('#breadcrumb span').forEach(span => {
        span.classList.remove('sub_title_bold');
    });
    document.getElementById(`step${currentStep}_text`).classList.add('sub_title_bold');

    // 버튼 상태 업데이트
    updateButtonStates();
}

// 버튼 상태 업데이트
function updateButtonStates() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    // 이전 버튼은 첫 번째 스텝에서만 비활성화
    prevBtn.disabled = currentStep === 1;

    // Step 1에서는 필수 약관 체크 여부에 따라 다음 버튼 활성화
    if (currentStep === 1) {
        const isValid = validateRequiredTerms();
        nextBtn.disabled = !isValid;

        if (!isValid) {
            nextBtn.style.backgroundColor = '#ccc';
            nextBtn.style.background = '#ccc';
            nextBtn.style.cursor = 'not-allowed';
            nextBtn.style.opacity = '0.6';
        } else {
            nextBtn.style.backgroundColor = '';
            nextBtn.style.background = '';
            nextBtn.style.cursor = '';
            nextBtn.style.opacity = '';
        }
    } else {
        nextBtn.disabled = false;
        nextBtn.style.backgroundColor = '';
        nextBtn.style.background = '';
        nextBtn.style.cursor = '';
        nextBtn.style.opacity = '';
    }

    // 마지막 스텝에서 버튼 텍스트 변경
    if (currentStep === totalSteps) {
        nextBtn.textContent = '가입완료';
    } else {
        nextBtn.textContent = '다음';
    }
}

// 다음 스텝으로 이동
function nextStep() {
    // Step 1에서 필수 약관 체크 확인
    if (currentStep === 1 && !validateRequiredTerms()) {
        alert('필수 약관에 동의해주세요.\n- 개인정보 수집 및 이용 동의\n- 개인정보 제3자 제공 동의');
        return;
    }


    // ✅ 현재 iframe의 form을 찾고 submit!
    const activeIframe = document.querySelector('.content_step.active iframe');
    if (activeIframe) {
        const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
        const form = iframeDoc.querySelector('form');
        if (form) {
            // ✅ Step1 (약관동의)만 유효성 체크!
            if (currentStep === 1 && typeof iframeDoc.validateTerms === 'function') {
                if (!iframeDoc.validateTerms()) {
                    return; // 필수 체크 안되면 stop
                }
            }

            // ✅ form을 submit (서버로 POST)
            form.submit();

            // ✅ iframe submit 후 step 증가 → nextStep으로 전환
            currentStep++;
            updateStep();
            return; // 아래 로직은 skip
        }
    }

    // ✅ 단계만 넘기는 로직 (iframe form이 없거나 submit 안했을 때)
    if (currentStep < totalSteps) {
        currentStep++;
        updateStep();
    } else {

        // 회원가입 완료 처리
        completeRegistration();

        // 마지막 단계 처리 (강아지 키워드까지 완료)
        alert('회원가입이 완료되었습니다!');
        goHome();

    }
}

// 이전 스텝으로 이동
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

// 홈으로 이동
function goHome() {
    if (confirm('회원가입을 중단하고 홈으로 이동하시겠습니까?')) {
        window.location.href = '/';
    }
}

// 회원가입 완료 처리
function completeRegistration() {
    alert('회원가입이 완료되었습니다!');
    window.location.href = '/login';
}

// 약관 동의 상태 확인 함수 (다른 스크립트에서 사용 가능)
function getTermsStatus() {
    return {
        all: document.getElementById('terms_all')?.checked || false,
        service: document.getElementById('terms_service')?.checked || false,
        privacy: document.getElementById('terms_privacy')?.checked || false,
        marketing: document.getElementById('terms_marketing')?.checked || false
    };
}