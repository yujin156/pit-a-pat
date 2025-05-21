<!--    프로필 추가 팝업   -->
document.addEventListener('DOMContentLoaded', function() {
    console.log('스크립트 로드 OK');
    // 가족(강아지) 데이터 배열
    let pets = [
        {
            name: '쪼꼬',
            image: '/img/Choco.jpg',
            status: '산책 중',
            gender: 'male',
            type: '푸들',
            birthday: '2021-05-15',
            intro: '사람을 좋아하는 활발한 성격입니다.'
        },
        {
            name: '강군',
            image: '/img/kangKun.JPG',
            status: '으르렁',
            gender: 'male',
            type: '푸들',
            birthday: '2020-05-30',
            intro: '사람 좋아, 강아지 좋아'
        }
    ];

    // 프로필 초기 렌더링
    // const profilesGrid = document.querySelector('.profiles_grid');
    // if (profilesGrid) renderProfilesGrid();
    //
    // const petStatusesContainer = document.querySelector('.pet_statuses');
    // if (petStatusesContainer) renderPetStatuses();

    // 프로필 그리드 렌더링 함수
    function renderProfilesGrid() {
        const profilesGrid = document.querySelector('.profiles_grid');
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
                pets[petIndex].status = this.value;
            });

            statusSelectDiv.appendChild(select);
            petStatusDiv.appendChild(statusLabel);
            petStatusDiv.appendChild(statusSelectDiv);

            petStatusesContainer.appendChild(petStatusDiv);
        });
    }

    // 월/일 선택 옵션 채우기
    function fillDateOptions() {
        const monthSelect = document.getElementById('birthMonth');
        const daySelect = document.getElementById('birthDay');

        if(monthSelect.options.length <= 1) {
            for(let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                monthSelect.appendChild(option);
            }
        }

        if(daySelect.options.length <= 1) {
            for(let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                daySelect.appendChild(option);
            }
        }
    }

    // 모달 관련 요소
    const modal = document.getElementById('addFamilyModal');
    const addFamilyBtn = document.querySelector('.add_family');
    const cancelBtn = document.getElementById('cancelButton');
    const addPetBtn = document.getElementById('addPetButton');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('fileInput');

    // 이미지 업로드 영역 클릭 이벤트
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

    // 새로운 가족 추가 버튼 클릭 이벤트
    addFamilyBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        fillDateOptions();

        document.getElementById('dogName').value = '';
        document.getElementById('dogGender').selectedIndex = 0;
        document.getElementById('dogType').value = '';
        document.getElementById('birthYear').selectedIndex = 0;
        document.getElementById('birthMonth').selectedIndex = 0;
        document.getElementById('birthDay').selectedIndex = 0;
        document.getElementById('dogIntro').value = '';

        imageUploadArea.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="29.015" height="29" viewBox="0 0 29.015 29">
                    <path id="upload-image" d="M25.482,17.573A1.381,1.381,0,0,0,24.1,18.955v.525l-2.044-2.044a3.854,3.854,0,0,0-5.428,0l-.967.967-3.426-3.426a3.937,3.937,0,0,0-5.428,0L4.763,17.021V9.286A1.381,1.381,0,0,1,6.144,7.9h9.669a1.381,1.381,0,0,0,0-2.763H6.144A4.144,4.144,0,0,0,2,9.286V25.861A4.144,4.144,0,0,0,6.144,30H22.719a4.144,4.144,0,0,0,4.144-4.144V18.955A1.381,1.381,0,0,0,25.482,17.573ZM6.144,27.242a1.381,1.381,0,0,1-1.381-1.381V20.93l4.006-4.006a1.091,1.091,0,0,1,1.506,0L14.652,21.3h0l5.939,5.939ZM24.1,25.861a1.229,1.229,0,0,1-.249.732l-6.23-6.257.967-.967a1.064,1.064,0,0,1,1.519,0l3.992,4.02ZM30.606,5.542,26.462,1.4a1.428,1.428,0,0,0-1.961,0L20.357,5.542A1.387,1.387,0,0,0,22.319,7.5l1.782-1.8V13.43a1.381,1.381,0,1,0,2.763,0V5.708l1.782,1.8a1.387,1.387,0,1,0,1.961-1.961Z" transform="translate(-2 -1.005)" fill="#b7b7b7"/>
                    </svg>
                    <p class="upload-text">강아지 사진 올리기</p>
                `;
    });

    // 취소 버튼 클릭 이벤트
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
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
    addPetBtn.addEventListener('click', function() {
        // 기본 폼 검증 로직을 여기에 추가할 수 있습니다
        modal.style.display = 'none';
        keywordModal.style.display = 'block';
    });

// 키워드 버튼 클릭 이벤트
    keywordButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

// 취소 버튼 클릭 이벤트
    keywordCancelButton.addEventListener('click', function() {
        keywordModal.style.display = 'none';
    });

// 이전 버튼 클릭 이벤트
    keywordPreviousButton.addEventListener('click', function() {
        keywordModal.style.display = 'none';
        modal.style.display = 'block';
    });

// 완료 버튼 클릭 이벤트
    keywordCompleteButton.addEventListener('click', function() {
        // 선택된 키워드 수집 로직
        const selectedKeywords = [];
        document.querySelectorAll('.keyword-btn.selected').forEach(btn => {
            selectedKeywords.push(btn.textContent);
        });

        // 여기서 선택된 키워드와 기존 가족 추가 정보를 처리/저장
        console.log('선택된 키워드:', selectedKeywords);

        // 모든 모달 닫기
        keywordModal.style.display = 'none';

        // 선택적으로 완료 메시지나 다음 단계로 진행
        alert('가족 추가가 완료되었습니다!');
    });

// 모달 외부 클릭 시 닫기 이벤트 확장
    window.addEventListener('click', function(event) {
        if (event.target === keywordModal) {
            keywordModal.style.display = 'none';
        }
    });

    // 새 반려동물 추가 버튼 클릭 이벤트
    addPetBtn.addEventListener('click', function() {
        const dogName = document.getElementById('dogName').value.trim();
        const dogGender = document.getElementById('dogGender').value;
        const dogType = document.getElementById('dogType').value.trim();
        const birthYear = document.getElementById('birthYear').value;
        const birthMonth = document.getElementById('birthMonth').value;
        const birthDay = document.getElementById('birthDay').value;
        const dogIntro = document.getElementById('dogIntro').value.trim();

        if (dogName === '') {
            alert('강아지 이름을 입력해주세요.');
            return;
        }

        let dogImage = 'https://via.placeholder.com/120?text=' + dogName;

        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                dogImage = e.target.result;
                addNewPet(dogName, dogGender, dogType, birthYear, birthMonth, birthDay, dogIntro, dogImage);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            addNewPet(dogName, dogGender, dogType, birthYear, birthMonth, birthDay, dogIntro, dogImage);
        }
    });

    // 새 반려동물 추가 함수
    function addNewPet(name, gender, type, year, month, day, intro, image) {
        const birthday = year && month && day ? `${year}-${month}-${day}` : '';

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

        modal.style.display = 'none';
    }
});

<!--    친한 친구 편집    -->

    document.addEventListener('DOMContentLoaded', function() {
    // 초기 친구 데이터
    let friends = [
{ id: 1, name: '구름', image: '/img/구름.png', status: '밥 먹는 중' },
{ id: 2, name: '월이', image: '/img/월이.png', status: '밥 먹는 중' },
{ id: 3, name: '콩이', image: '/img/콩이.png', status: '밥 먹는 중' },
{ id: 4, name: '먹보', image: '/img/구름이.png', status: '밥 먹는 중' },
{ id: 5, name: '또또', image: '/img/또또.png', status: '밥 먹는 중' }
    ];

    // DOM 요소
    const friendsContainer = document.getElementById('friendsContainer');
    const friendList = document.getElementById('friendList');
    const btnEdit = document.getElementById('btnEdit');
    const btnDone = document.getElementById('btnDone');
    const btnAddFriend = document.getElementById('btnAddFriend');

    // 친구 목록 렌더링 함수
    function renderFriends() {
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
    friendsContainer.classList.toggle('editing');
    btnEdit.classList.toggle('hidden');
    btnDone.classList.toggle('hidden');
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

    // 이벤트 리스너 설정
    btnEdit.addEventListener('click', toggleEditMode);
    btnDone.addEventListener('click', toggleEditMode);
    btnAddFriend.addEventListener('click', addFriend);

    // 초기 렌더링
    renderFriends();
});