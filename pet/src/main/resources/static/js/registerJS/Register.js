
let currentStep = 1;
const totalSteps = 5;
let dogImageIndex = 0;

// 강아지 이미지 자동 변경
function rotateDogImages() {
    const images = document.querySelectorAll('.dog_image');
    if (images.length > 0) {
        images[dogImageIndex].classList.remove('active');
        dogImageIndex = (dogImageIndex + 1) % images.length;
        images[dogImageIndex].classList.add('active');
    }
}
// 강아지 슬라이드 자동
setInterval(rotateDogImages, 3000);


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
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentStep === 1;

    if (currentStep === totalSteps) {
        nextBtn.textContent = '완료';
    } else {
        nextBtn.textContent = '다음';
    }
}

// 다음 스텝
function nextStep() {
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
        // 마지막 단계 처리 (강아지 키워드까지 완료)
        alert('회원가입이 완료되었습니다!');
        goHome();
    }
}

// 이전 스텝
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

// 홈으로 이동
function goHome() {
    window.location.href = '/';
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register 시스템 초기화');
    updateStep();
});