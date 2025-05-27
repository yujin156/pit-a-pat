// Login_center.js - 수정된 버전
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login_center.js 로드 완료');

    // 가족(강아지) 데이터 배열
    // let pets = [
    //     {
    //         name: '쪼꼬',
    //         image: '/img/Choco.jpg',
    //         status: '산책 중',
    //         gender: 'male',
    //         type: '푸들',
    //         birthday: '2021-05-15',
    //         intro: '사람을 좋아하는 활발한 성격입니다.'
    //     },
    //     {
    //         name: '강군',
    //         image: '/img/kangKun.JPG',
    //         status: '으르렁',
    //         gender: 'male',
    //         type: '푸들',
    //         birthday: '2020-05-30',
    //         intro: '사람 좋아, 강아지 좋아'
    //     }
    // ];

    // 월/일 선택 옵션 채우기
    function fillDateOptions() {
        const monthSelect = document.getElementById('birthMonth');
        const daySelect = document.getElementById('birthDay');

        if (monthSelect && monthSelect.options.length <= 1) {
            for(let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                monthSelect.appendChild(option);
            }
        }

        if (daySelect && daySelect.options.length <= 1) {
            for(let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                daySelect.appendChild(option);
            }
        }
    }

    // 프로필 그리드 렌더링 함수
    function renderProfilesGrid() {
        const profilesGrid = document.querySelector('.profiles_grid');
        if (!profilesGrid) return;

        profilesGrid.innerHTML = '';

        pets.forEach(pet => {
            const profileItem = document.createElement('div');
            profileItem.className = 'profile_item';

            const img = document.createElement('img');
            img.src = pet.image;
            img.alt = `${pet.name} 프로필 이미지`;

            profileItem.appendChild(img);
            profilesGrid.appendChild(profileItem);
        });
    }

    // 펫 상태 목록 렌더링 함수
    function renderPetStatuses() {
        const petStatusesContainer = document.querySelector('.pet_statuses');
        if (!petStatusesContainer) return;

        petStatusesContainer.innerHTML = '';

        pets.forEach((pet, index) => {
            const petStatusDiv = document.createElement('div');
            petStatusDiv.className = 'pet_status';

            const statusLabel = document.createElement('span');
            statusLabel.className = 'status_label';
            statusLabel.textContent = pet.name;

            const statusSelectDiv = document.createElement('div');
            statusSelectDiv.className = 'status_select';

            const select = document.createElement('select');
            select.dataset.petIndex = index;

            const options = ['밥 먹는 중', '산책 중', '잠자는 중', '으르렁'];
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.textContent = option;
                optionElement.value = option;
                if (option === pet.status) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            });

            select.addEventListener('change', function() {
                const petIndex = parseInt(this.dataset.petIndex);
                if (pets[petIndex]) {
                    pets[petIndex].status = this.value;
                }
            });

            statusSelectDiv.appendChild(select);
            petStatusDiv.appendChild(statusLabel);
            petStatusDiv.appendChild(statusSelectDiv);

            petStatusesContainer.appendChild(petStatusDiv);
        });
    }

    // 모달 관련 요소들 - 안전하게 가져오기
    const modal = document.getElementById('modal');
    const addFamilyBtn = document.getElementById('addFamilyBtn');
    const cancelBtn = document.getElementById('cancelButton');
    const addPetBtn = document.getElementById('addPetButton');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('fileInput');

    // 이미지 업로드 영역 클릭 이벤트
    if (imageUploadArea && fileInput) {
        imageUploadArea.addEventListener('click', function() {
            fileInput.click();
        });

        // 파일 선택 이벤트
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    imageUploadArea.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">`;
                }

                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // 새로운 가족 추가 버튼 클릭 이벤트 - 안전하게 처리
    if (addFamilyBtn && modal && imageUploadArea) {
        addFamilyBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            fillDateOptions();

            // 폼 초기화 - 안전하게 처리
            const dogName = document.getElementById('dogName');
            const dogGender = document.getElementById('dogGender');
            const dogType = document.getElementById('dogType');
            const birthYear = document.getElementById('birthYear');
            const birthMonth = document.getElementById('birthMonth');
            const birthDay = document.getElementById('birthDay');
            const dogIntro = document.getElementById('dogIntro');

            if (dogName) dogName.value = '';
            if (dogGender) dogGender.selectedIndex = 0;
            if (dogType) dogType.value = '';
            if (birthYear) birthYear.selectedIndex = 0;
            if (birthMonth) birthMonth.selectedIndex = 0;
            if (birthDay) birthDay.selectedIndex = 0;
            if (dogIntro) dogIntro.value = '';

            imageUploadArea.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="29.015" height="29" viewBox="0 0 29.015 29">
                <path id="upload-image" d="M25.482,17.573A1.381,1.381,0,0,0,24.1,18.955v.525l-2.044-2.044a3.854,3.854,0,0,0-5.428,0l-.967.967-3.426-3.426a3.937,3.937,0,0,0-5.428,0L4.763,17.021V9.286A1.381,1.381,0,0,1,6.144,7.9h9.669a1.381,1.381,0,0,0,0-2.763H6.144A4.144,4.144,0,0,0,2,9.286V25.861A4.144,4.144,0,0,0,6.144,30H22.719a4.144,4.144,0,0,0,4.144-4.144V18.955A1.381,1.381,0,0,0,25.482,17.573ZM6.144,27.242a1.381,1.381,0,0,1-1.381-1.381V20.93l4.006-4.006a1.091,1.091,0,0,1,1.506,0L14.652,21.3h0l5.939,5.939ZM24.1,25.861a1.229,1.229,0,0,1-.249.732l-6.23-6.257.967-.967a1.064,1.064,0,0,1,1.519,0l3.992,4.02ZM30.606,5.542,26.462,1.4a1.428,1.428,0,0,0-1.961,0L20.357,5.542A1.387,1.387,0,0,0,22.319,7.5l1.782-1.8V13.43a1.381,1.381,0,1,0,2.763,0V5.708l1.782,1.8a1.387,1.387,0,1,0,1.961-1.961Z" transform="translate(-2 -1.005)" fill="#b7b7b7"/>
                </svg>
                <p class="upload-text">강아지 사진 올리기</p>
            `;
        });
    } else {
        console.warn('필요한 요소들이 없습니다:', {
            addFamilyBtn: !!addFamilyBtn,
            modal: !!modal,
            imageUploadArea: !!imageUploadArea
        });
    }

    // 취소 버튼 클릭 이벤트
    if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 키워드 모달 관련 JavaScript
    const keywordModal = document.getElementById('keywordModal');
    const keywordCancelButton = document.getElementById('keywordCancelButton');
    const keywordPreviousButton = document.getElementById('keywordPreviousButton');
    const keywordCompleteButton = document.getElementById('keywordCompleteButton');
    const keywordButtons = document.querySelectorAll('.keyword-btn');

    // 가족 추가 모달의 다음 버튼 클릭 시 키워드 모달로 전환
    if (addPetBtn && modal && keywordModal) {
        addPetBtn.addEventListener('click', function() {
            // 기본 폼 검증
            const dogName = document.getElementById('dogName');
            if (!dogName || dogName.value.trim() === '') {
                alert('강아지 이름을 입력해주세요.');
                return;
            }

            modal.style.display = 'none';
            keywordModal.style.display = 'block';
        });
    }

    // 키워드 버튼 클릭 이벤트
    keywordButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    // 키워드 모달 취소 버튼
    if (keywordCancelButton && keywordModal) {
        keywordCancelButton.addEventListener('click', function() {
            keywordModal.style.display = 'none';
        });
    }

    // 키워드 모달 이전 버튼
    if (keywordPreviousButton && keywordModal && modal) {
        keywordPreviousButton.addEventListener('click', function() {
            keywordModal.style.display = 'none';
            modal.style.display = 'block';
        });
    }

    // 키워드 모달 완료 버튼
    if (keywordCompleteButton && keywordModal) {
        keywordCompleteButton.addEventListener('click', function() {
            // 선택된 키워드 수집
            const selectedKeywords = [];
            document.querySelectorAll('.keyword-btn.selected').forEach(btn => {
                selectedKeywords.push(btn.textContent);
            });

            console.log('선택된 키워드:', selectedKeywords);

            // 새 펫 추가
            addNewPetFromForm();

            // 모든 모달 닫기
            keywordModal.style.display = 'none';

            // 완료 메시지
            alert('가족 추가가 완료되었습니다!');
        });
    }

    // 모달 외부 클릭 시 닫기 이벤트 확장
    window.addEventListener('click', function(event) {
        if (keywordModal && event.target === keywordModal) {
            keywordModal.style.display = 'none';
        }
    });

    // 새 반려동물 추가 함수
    function addNewPetFromForm() {
        const dogName = document.getElementById('dogName');
        const dogGender = document.getElementById('dogGender');
        const dogType = document.getElementById('dogType');
        const birthYear = document.getElementById('birthYear');
        const birthMonth = document.getElementById('birthMonth');
        const birthDay = document.getElementById('birthDay');
        const dogIntro = document.getElementById('dogIntro');

        const name = dogName ? dogName.value.trim() : '';
        const gender = dogGender ? dogGender.value : '';
        const type = dogType ? dogType.value.trim() : '';
        const year = birthYear ? birthYear.value : '';
        const month = birthMonth ? birthMonth.value : '';
        const day = birthDay ? birthDay.value : '';
        const intro = dogIntro ? dogIntro.value.trim() : '';

        if (name === '') {
            alert('강아지 이름을 입력해주세요.');
            return;
        }

        let dogImage = 'https://via.placeholder.com/120?text=' + encodeURIComponent(name);

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                dogImage = e.target.result;
                addNewPet(name, gender, type, year, month, day, intro, dogImage);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            addNewPet(name, gender, type, year, month, day, intro, dogImage);
        }
    }

    // 새 반려동물 추가 함수
    function addNewPet(name, gender, type, year, month, day, intro, image) {
        const birthday = year && month && day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';

        const newPet = {
            name: name,
            image: image,
            status: '산책 중',
            gender: gender || '',
            type: type || '',
            birthday: birthday,
            intro: intro || ''
        };

        pets.push(newPet);

        renderProfilesGrid();
        renderPetStatuses();

        console.log('새 펫이 추가되었습니다:', newPet);
    }

    // // 초기 친구 데이터
    // let friends = [
    //     { id: 1, name: '구름', image: '/img/구름.png', status: '밥 먹는 중' },
    //     { id: 2, name: '월이', image: '/img/월이.png', status: '밥 먹는 중' },
    //     { id: 3, name: '콩이', image: '/img/콩이.png', status: '밥 먹는 중' },
    //     { id: 4, name: '먹보', image: '/img/구름이.png', status: '밥 먹는 중' },
    //     { id: 5, name: '또또', image: '/img/또또.png', status: '밥 먹는 중' }
    // ];

    // DOM 요소
    const friendsContainer = document.getElementById('friendsContainer');
    const friendList = document.getElementById('friendList');
    const btnEdit = document.getElementById('btnEdit');
    const btnDone = document.getElementById('btnDone');
    const btnAddFriend = document.getElementById('btnAddFriend');

    // 친구 목록 렌더링 함수
    function renderFriends() {
        if (!friendList) return;

        friendList.innerHTML = '';

        friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.dataset.id = friend.id;

            friendItem.innerHTML = `
                <div class="friend-info">
                  <img src="${friend.image}" alt="${friend.name}" class="friend-avatar">
                  <span class="friend-name">${friend.name}</span>
                </div>
                <div>
                  <span class="friend-status">${friend.status}</span>
                  <button class="btn-remove" data-id="${friend.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              `;

            friendList.appendChild(friendItem);
        });

        // 삭제 버튼에 이벤트 리스너 추가
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const friendId = parseInt(this.dataset.id);
                removeFriend(friendId);
            });
        });
    }

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
        friends = friends.filter(friend => friend.id !== id);
        renderFriends();
    }

    // 친구 추가 함수
    function addFriend() {
        const newId = Math.max(...friends.map(f => f.id), 0) + 1;
        const newFriend = {
            id: newId,
            name: `친구 ${newId}`,
            image: 'https://via.placeholder.com/48',
            status: '밥 먹는 중'
        };

        friends.push(newFriend);
        renderFriends();
    }

    // 이벤트 리스너 설정 - 안전하게 처리
    if (btnEdit) btnEdit.addEventListener('click', toggleEditMode);
    if (btnDone) btnDone.addEventListener('click', toggleEditMode);
    if (btnAddFriend) btnAddFriend.addEventListener('click', addFriend);

    // 초기 렌더링
    renderFriends();

    console.log('Login_center.js 초기화 완료');
});