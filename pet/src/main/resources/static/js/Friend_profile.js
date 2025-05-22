// 강아지 프로필 데이터
const dogProfiles = [
    {
        id: 1,
        name: "구름",
        group: "내향적 강아지 모임",
        location: "수유3동",
        gender: "수컷 (중성화O)",
        breed: "비숑",
        size: "소형견",
        birthday: "2018년 7월 7일",
        keywords: ["내향적", "엄마 껌딱지 겁쟁이", "주변에 관심없는 나혼자 산다형"],
        intro: "닭고기 알러지가 있어요.\n산책은 주기적으로 하고 풍성한 머리가 포인트에요.\n옷 입는걸 싫어하고 대형견을 보면 짖어요.\n활발한 강아지나 아기 강아지는 조금 힘들어해요.",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", // 비숑 이미지
        isFavorite: false
    },
    {
        id: 2,
        name: "월이",
        group: "사자가 되지 못한 라이언",
        location: "서교동",
        gender: "수컷 (중성화X)",
        breed: "포메라니안",
        size: "소형견",
        birthday: "2020년 3월 15일",
        keywords: ["활발함", "사교적", "장난꾸러기"],
        intro: "항상 밝고 활발해요.\n사람을 좋아하고 다른 강아지와 잘 어울립니다.\n간식을 좋아하고 놀이를 무척 좋아합니다.\n배변 훈련이 잘 되어있어요.",
        image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", // 포메라니안 이미지
        isFavorite: true
    }
];

// 현재 표시 중인 강아지 인덱스
let currentDogIndex = 0;

// 요소 참조
let starElement;
let leftBtn;
let rightBtn;
let deleteBtn;
let cancelBtn;
let confirmBtn;
let deleteModal;
let toastMsg;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 요소 참조 초기화
    starElement = document.getElementById('favorite-star');
    leftBtn = document.querySelector('.f_profile_left_btn');
    rightBtn = document.querySelector('.f_profile_right_btn');
    deleteBtn = document.getElementById('delete-friend-btn');
    cancelBtn = document.getElementById('cancel-delete');
    confirmBtn = document.getElementById('confirm-delete');
    deleteModal = document.getElementById('delete-modal');
    toastMsg = document.getElementById('toast-message');

    // 초기 데이터 표시
    updateProfile();

    // 이벤트 리스너 추가
    if (leftBtn) leftBtn.addEventListener('click', showPreviousDog);
    if (rightBtn) rightBtn.addEventListener('click', showNextDog);
    if (starElement) starElement.addEventListener('click', toggleFavorite);
    if (deleteBtn) deleteBtn.addEventListener('click', showDeleteModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideDeleteModal);
    if (confirmBtn) confirmBtn.addEventListener('click', deleteFriend);
});

// 이전 강아지 프로필 표시
function showPreviousDog() {
    if (currentDogIndex > 0) {
        slideToProfile(currentDogIndex - 1);
        showToast("이전 친구 프로필을 불러왔습니다.");
    }
}

// 다음 강아지 프로필 표시
function showNextDog() {
    if (currentDogIndex < dogProfiles.length - 1) {
        slideToProfile(currentDogIndex + 1);
        showToast("다음 친구 프로필을 불러왔습니다.");
    }
}

// 부드러운 슬라이드 효과로 프로필 변경
function slideToProfile(newIndex) {
    if (newIndex < 0 || newIndex >= dogProfiles.length) return;

    // 현재 프로필 페이드아웃
    const currentSlide = document.querySelector('.profile-slide.active');
    if (currentSlide) {
        currentSlide.classList.remove('active');
    }

    // 잠시 후 새 프로필로 업데이트
    setTimeout(() => {
        currentDogIndex = newIndex;
        updateProfileContent();
        updateNavigationButtons();

        // 새 프로필 페이드인
        setTimeout(() => {
            const newSlide = document.querySelector('.profile-slide');
            if (newSlide) {
                newSlide.classList.add('active');
            }
        }, 50);
    }, 250);
}

// 프로필 정보 업데이트
function updateProfile() {
    if (dogProfiles.length === 0) {
        document.querySelector('.f_profile').innerHTML = '<div class="no-friends">등록된 친구가 없습니다.</div>';
        // 친구가 없으면 양쪽 버튼 모두 숨기기
        if (leftBtn) leftBtn.classList.add('hidden');
        if (rightBtn) rightBtn.classList.add('hidden');
        return;
    }

    // 프로필 슬라이드 컨테이너 생성
    const profileContainer = document.querySelector('.f_profile');
    profileContainer.innerHTML = `
        <div class="profile-slide active">
            <div class="f_profile_card">
                <div class="profile_txt">
                    <div class="profile_name_icon">
                        <h3 class="profile_name"></h3>
                        <div class="profile_hart_icon">
                            <svg id="Animated_Heart" data-name="Animated Heart" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="39.46" height="34.444" viewBox="0 0 39.46 34.444">
                                <defs>
                                    <clipPath id="clip-path">
                                        <path id="Heart_Mask" data-name="Heart Mask" d="M37.966,6.043a10.377,10.377,0,0,0-14.687,0l-2,2-2-2A10.389,10.389,0,0,0,4.59,20.742l2,2,14.687,14.7,14.687-14.7,2-2a10.4,10.4,0,0,0,0-14.7Z" transform="translate(-1.549 -2.998)" fill="#eda9dd"/>
                                    </clipPath>
                                </defs>
                                <g id="Animated_Heart-2" data-name="Animated Heart" clip-path="url(#clip-path)">
                                    <path id="Simple_Heart" data-name="Simple Heart" d="M37.966,6.043a10.377,10.377,0,0,0-14.687,0l-2,2-2-2A10.389,10.389,0,0,0,4.59,20.742l2,2,14.687,14.7,14.687-14.7,2-2a10.4,10.4,0,0,0,0-14.7Z" transform="translate(-1.549 -2.998)" fill="#eda9dd"/>
                                    <path id="Heart_Liquid" data-name="Heart Liquid" d="M-5.756-8.178c3.752-7.616,8.77-9.917,26.474,0s22.426-10.5,28.105,0,2.336,40.287,2.336,40.287H-8.026S-9.508-.562-5.756-8.178Z" transform="translate(-0.875 2.396)" fill="#eda9dd"/>
                                </g>
                            </svg>
                        </div>
                    </div>
                    <p class="profile_group_title"></p>
                    <div class="profile_keyword_row">
                        <label class="profile_pink profile_location"></label>
                        <label class="profile_blue profile_gender_label"></label>
                        <label class="profile_blue profile_breed_label"></label>
                    </div>
                    <div class="profile_keyword_row profile_keywords_container">
                    </div>
                </div>
                <div class="profile_card_gradient"></div>
                <div class="profile_card_img"></div>
            </div>
            <div class="f_profile_info">
                <div class="profile_info_row">
                    <label class="profile_pink">견종</label>
                    <span class="profile_type"></span>
                    <label class="profile_white">소형견</label>
                    <div class="profile_star" id="favorite-star">
                        <svg xmlns="http://www.w3.org/2000/svg" width="38.601" height="36.856" viewBox="0 0 38.601 36.856">
                            <g id="Artboard" transform="translate(1.5 1.5)">
                                <g id="star">
                                    <path id="Shape" d="M17.8,0l5.5,11.143,12.3,1.8L26.7,21.61l2.1,12.247-11-5.785-11,5.785L8.9,21.61,0,12.941l12.3-1.8Z" fill="#B7B7B7" stroke="#B7B7B7" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill-rule="evenodd"/>
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
                <div class="profile_info_row">
                    <label class="profile_pink">성별</label>
                    <span class="profile_gender"></span>
                </div>
                <div class="profile_info_row">
                    <label class="profile_pink">생일</label>
                    <span class="profile_birthday"></span>
                </div>
                <div class="profile_gift">
                    <label class="profile_send_gift">친구에게 선물 보내기</label>
                    <div class="profile_gift_icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24.644" height="24.603" viewBox="0 0 24.644 24.603">
                            <g id="그룹_162474" data-name="그룹 162474" transform="translate(-1278.838 -491.139)">
                                <path id="패스_83409" data-name="패스 83409" d="M3.516,13.42H21.128v8.806a1.258,1.258,0,0,1-1.258,1.258H4.774a1.258,1.258,0,0,1-1.258-1.258Zm8.806,10.064V8.388M1,9.646A1.258,1.258,0,0,1,2.258,8.388H22.386a1.258,1.258,0,0,1,1.258,1.258v2.516a1.258,1.258,0,0,1-1.258,1.258H2.258A1.258,1.258,0,0,1,1,12.162ZM12.444,7.13c-.55-3.749-6.29-8.177-8.411-5.095-2,2.908,2.121,6.353,7.153,5.095" transform="translate(1278.838 491.258)" fill="none" stroke="#387feb" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                <path id="패스_83410" data-name="패스 83410" d="M10,7.13c.55-3.749,6.29-8.177,8.411-5.095,2.005,2.908-2.121,6.353-7.153,5.095" transform="translate(1281.16 491.258)" fill="none" stroke="#387feb" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                            </g>
                        </svg>
                    </div>
                </div>
                <label class="profile_pink">강아지 소개</label>
                <p class="dog_intro"></p>
                <button class="profile_white" id="delete-friend-btn">친구 삭제하기</button>
            </div>
        </div>
    `;

    // 새로 생성된 요소들에 대한 이벤트 리스너 재등록
    starElement = document.getElementById('favorite-star');
    deleteBtn = document.getElementById('delete-friend-btn');

    if (starElement) starElement.addEventListener('click', toggleFavorite);
    if (deleteBtn) deleteBtn.addEventListener('click', showDeleteModal);

    // 프로필 내용 업데이트
    updateProfileContent();

    // 화살표 버튼 표시/숨김 업데이트
    updateNavigationButtons();
}

// 프로필 내용만 업데이트하는 함수 (슬라이드 효과용)
function updateProfileContent() {
    if (dogProfiles.length === 0) return;

    const dog = dogProfiles[currentDogIndex];

    // 프로필 정보 업데이트
    const nameElement = document.querySelector('.profile_name');
    const groupElement = document.querySelector('.profile_group_title');
    const cardImgElement = document.querySelector('.profile_card_img');

    if (nameElement) nameElement.textContent = dog.name;
    if (groupElement) groupElement.textContent = dog.group;

    // 이미지 설정
    if (cardImgElement) {
        console.log('Setting image for:', dog.name, 'Image URL:', dog.image);
        cardImgElement.style.backgroundImage = `url('${dog.image}')`;
    }

    // 프로필 카드 첫 번째 키워드 행 업데이트 (위치, 성별, 견종)
    const locationElement = document.querySelector('.profile_location');
    const genderLabelElement = document.querySelector('.profile_gender_label');
    const breedLabelElement = document.querySelector('.profile_breed_label');

    if (locationElement) locationElement.textContent = dog.location;
    if (genderLabelElement) genderLabelElement.textContent = dog.gender.includes('수컷') ? '수컷' : '암컷';
    if (breedLabelElement) breedLabelElement.textContent = dog.breed;

    // 두 번째 키워드 행 업데이트 (성격 키워드들)
    const keywordsContainer = document.querySelector('.profile_keywords_container');
    if (keywordsContainer) {
        keywordsContainer.innerHTML = dog.keywords.map(keyword =>
            `<label class="profile_blue">${keyword}</label>`
        ).join('');
    }

    // 오른쪽 정보 영역 업데이트
    const typeElement = document.querySelector('.profile_type');
    const genderElement = document.querySelector('.profile_gender');
    const birthdayElement = document.querySelector('.profile_birthday');
    const introElement = document.querySelector('.dog_intro');

    if (typeElement) typeElement.textContent = dog.breed;
    if (genderElement) genderElement.textContent = dog.gender;
    if (birthdayElement) birthdayElement.textContent = dog.birthday;
    if (introElement) introElement.textContent = dog.intro;

    // 즐겨찾기 상태 업데이트
    if (starElement) {
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
}

// 네비게이션 버튼 상태 업데이트 함수
function updateNavigationButtons() {
    if (!leftBtn || !rightBtn) return;

    // 강아지가 1마리만 있는 경우 양쪽 버튼 모두 숨기기
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

// 즐겨찾기 토글 기능
function toggleFavorite() {
    const dog = dogProfiles[currentDogIndex];
    dog.isFavorite = !dog.isFavorite;

    // 즐겨찾기 상태 업데이트
    const path = starElement.querySelector('path');
    if (dog.isFavorite) {
        starElement.classList.add('active');
        if (path) {
            path.setAttribute('fill', '#EDA9DD');
            path.setAttribute('stroke', '#EDA9DD');
        }
        showToast(`${dog.name}이(가) 즐겨찾기에 추가되었습니다.`);
    } else {
        starElement.classList.remove('active');
        if (path) {
            path.setAttribute('fill', '#B7B7B7');
            path.setAttribute('stroke', '#B7B7B7');
        }
        showToast(`${dog.name}이(가) 즐겨찾기에서 제거되었습니다.`);
    }
}

// 삭제 모달 표시
function showDeleteModal() {
    if (deleteModal) deleteModal.classList.add('active');
}

// 삭제 모달 숨기기
function hideDeleteModal() {
    if (deleteModal) deleteModal.classList.remove('active');
}

// 친구 삭제 처리
function deleteFriend() {
    const dogName = dogProfiles[currentDogIndex].name;

    // 배열에서 현재 프로필 제거
    dogProfiles.splice(currentDogIndex, 1);

    // 인덱스 조정
    if (currentDogIndex >= dogProfiles.length) {
        currentDogIndex = Math.max(0, dogProfiles.length - 1);
    }

    // 모달 닫기
    hideDeleteModal();

    // 프로필이 남아있으면 업데이트, 없으면 메시지 표시
    updateProfile();
    showToast(`${dogName}이(가) 친구 목록에서 삭제되었습니다.`);
}

// 토스트 메시지 표시
function showToast(message) {
    if (!toastMsg) return;

    toastMsg.textContent = message;
    toastMsg.classList.add('show');

    // 3초 후 토스트 메시지 숨기기
    setTimeout(() => {
        toastMsg.classList.remove('show');
    }, 3000);
}