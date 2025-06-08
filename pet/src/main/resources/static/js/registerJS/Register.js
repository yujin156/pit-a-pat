// 전역 변수
let currentStep = 1;
const totalSteps = 5;
let dogImageIndex = 0;

// ✅ 강아지 순서를 위한 전역 변수
let currentDogIndex = 1;
let totalDogs = 1;

document.addEventListener('DOMContentLoaded', () => {
    initializeTermsCheckboxes();
    updateStep();
    startDogImageRotation();

    window.nextStep = nextStep;
    window.prevStep = prevStep;
    window.goHome = goHome;
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
function startDogImageRotation() {
    setInterval(rotateDogImages, 3000);
}

// 약관 체크박스
function initializeTermsCheckboxes() {
    const allTerms = document.getElementById('terms_all');
    const individualTerms = ['terms_service', 'terms_privacy', 'terms_marketing'];

    if (allTerms) {
        allTerms.addEventListener('change', function() {
            individualTerms.forEach(id => {
                const cb = document.getElementById(id);
                if (cb) cb.checked = this.checked;
            });
            updateButtonStates();
        });
    }

    individualTerms.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.addEventListener('change', () => {
                const allChecked = individualTerms.every(i => document.getElementById(i)?.checked);
                if (allTerms) allTerms.checked = allChecked;
                updateButtonStates();
            });
        }
    });
}
function validateRequiredTerms() {
    return ['terms_service', 'terms_privacy'].every(id => document.getElementById(id)?.checked);
}

// 스텝 업데이트
function updateStep() {

    document.querySelectorAll('.content_step').forEach(step => step.classList.remove('active'));
    document.getElementById(`content_step${currentStep}`).classList.add('active');

    document.querySelectorAll('.register_indication').forEach((indicator, index) => {
        indicator.classList.toggle('indication_active', index < currentStep);
    });
    document.querySelectorAll('.indication_line').forEach((line, index) => {
        line.classList.toggle('active', index < currentStep - 1);
    });
    document.querySelectorAll('#breadcrumb span').forEach(span => span.classList.remove('sub_title_bold'));
    document.getElementById(`step${currentStep}_text`).classList.add('sub_title_bold');

    updateButtonStates();
}
function updateButtonStates() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    prevBtn.disabled = currentStep === 1;

    if (currentStep === 1) {
        const isValid = validateRequiredTerms();
        nextBtn.disabled = !isValid;
        nextBtn.style.backgroundColor = isValid ? '' : '#ccc';
        nextBtn.style.cursor = isValid ? '' : 'not-allowed';
        nextBtn.style.opacity = isValid ? '' : '0.6';
    } else {
        nextBtn.disabled = false;
        nextBtn.style.backgroundColor = '';
        nextBtn.style.cursor = '';
        nextBtn.style.opacity = '';
    }

    nextBtn.textContent = currentStep === totalSteps ? '가입완료' : '다음';
}

// 다음 스텝 이동
function nextStep() {
    if (currentStep === 1 && !validateRequiredTerms()) {
        alert('필수 약관에 동의해주세요.');
        return;
    }

    // Step1 → Step2
    if (currentStep === 1) {
        const privacyAgree = document.getElementById('terms_service').checked;
        const marketingAgree = document.getElementById('terms_marketing').checked;
        const iframe = document.querySelector('#content_step2 iframe');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        const addHiddenInputs = () => {
            const form = iframeDoc.querySelector('form');
            if (form) {
                form.querySelectorAll('input[name=privacyAgree], input[name=marketingAgree]').forEach(e => e.remove());
                [['privacyAgree', privacyAgree], ['marketingAgree', marketingAgree]].forEach(([name, value]) => {
                    const input = iframeDoc.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = value;
                    form.appendChild(input);
                });
            }
        };
        iframe.onload = addHiddenInputs;
        if (iframeDoc && iframeDoc.readyState === 'complete') addHiddenInputs();
    }

    // Step2 → Step3
    if (currentStep === 2) {
        const activeIframe = document.querySelector('.content_step.active iframe');
        const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;

        const email = iframeDoc.getElementById('email')?.value.trim();
        if (!email.includes('@')) {
            alert('올바른 이메일 형식을 입력해주세요. (예: example@example.com)');
            iframeDoc.getElementById('email').focus();
            return;
        }

        const pw = iframeDoc.getElementById('password')?.value;
        const pwCheck = iframeDoc.getElementById('passwordCheck')?.value;

        if (!pw || !pwCheck) {
            alert('비밀번호를 모두 입력해주세요.');
            return;
        }
        if (pw !== pwCheck) {
            alert('비밀번호가 일치하지 않습니다.');
            iframeDoc.getElementById('passwordCheck').focus();
            return;
        }

        const dogCount = iframeDoc.getElementById('dogCount')?.value;
        if (!dogCount) {
            alert('🐶 강아지 마리 수를 선택해주세요!');
            return;
        }
        totalDogs = parseInt(dogCount, 10);
        currentDogIndex = 1; // ✅ 초기화

        document.querySelector('.content_step#content_step3 iframe').src = `/dog/register/step3?currentDogIndex=${currentDogIndex}&totalDogs=${totalDogs}`;
    }

    // Step3 → Step4
    if (currentStep === 3) {
        const activeIframe = document.querySelector('.content_step.active iframe');
        const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
        const selectedSize = iframeDoc.querySelector("input[name='size']:checked");
        if (!selectedSize) {
            alert("강아지 크기를 선택해주세요!");
            return;
        }

        const urlParams = new URL(activeIframe.src).searchParams;
        const currentDogIndex = urlParams.get('currentDogIndex');
        const totalDogs = urlParams.get('totalDogs');

        document.querySelector('.content_step#content_step4 iframe').src =
            `/dog/register/step4?currentDogIndex=${currentDogIndex}&totalDogs=${totalDogs}&size=${selectedSize.value}`;
    }

    // Step4 → Step5
    if (currentStep === 4) {
        const activeIframe = document.querySelector('.content_step#content_step4 iframe');

        // Step4 iframe이 로드되고 나서 dogId가 생성되는 시점에 아래 로직 실행
        activeIframe.onload = () => {
            const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;

            // Step4에서 dogId 생성
            const dogIdInput = iframeDoc.querySelector('input[name="dogId"]');

            if (dogIdInput && dogIdInput.value) {
                const dogId = dogIdInput.value; // dogId 값 가져오기

                // 2. URL 파라미터로 currentDogIndex, totalDogs, dogId 세팅
                const step5Iframe = document.querySelector('.content_step#content_step5 iframe');
                step5Iframe.src = `/dog/register/step5?currentDogIndex=${currentDogIndex}&totalDogs=${totalDogs}&dogId=${dogId}`;
            } else {
                console.warn('⚠️ dogId를 못찾았음! 다시 시도 필요');
            }
        };
    }


    // Step5: 키워드 선택 form submit → 여기서만 최종 완료!
    if (currentStep === 5) {
        const activeIframe = document.querySelector('.content_step#content_step5 iframe');
        const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
        const form = iframeDoc.querySelector('form');
        if (form) {
            form.submit();

            // ✅ 마지막 강아지가 아니면 다시 step3으로 루프
            if (currentDogIndex < totalDogs) {
                currentDogIndex++;
                currentStep = 3; // 다시 step3부터 시작!
                document.querySelector('.content_step#content_step3 iframe').src =
                    `/dog/register/step3?currentDogIndex=${currentDogIndex}&totalDogs=${totalDogs}`;
                updateStep();
                return;
            } else {
                // 마지막 강아지면 step5 iframe 요청 → 최종 완료!
                // ✅ 마지막 강아지 dogId를 여기서 다시 요청!
                const dogIdInput = iframeDoc.querySelector('input[name="dogId"]');
                const dogId = dogIdInput ? dogIdInput.value : '';
                document.querySelector('.content_step#content_step5 iframe').src =
                    `/dog/register/step5?currentDogIndex=${currentDogIndex}&totalDogs=${totalDogs}&dogId=${dogId}`;
                updateStep();
                completeRegistration();
                return;
            }
        }
    }

    // Step2~4: iframe 내부 form submit 후 다음 스텝으로 이동
    const activeIframe = document.querySelector('.content_step.active iframe');
    if (activeIframe) {
        const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
        const form = iframeDoc.querySelector('form');
        if (form) {
            form.submit();
            currentStep++;
            updateStep();
            return;
        }
    }

    // 기본: 다음 스텝으로 이동
    if (currentStep < totalSteps) {
        currentStep++;
        updateStep();
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
    window.location.href = '/';
}
