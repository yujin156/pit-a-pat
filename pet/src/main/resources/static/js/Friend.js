// 강아지 데이터 배열 - 실제 강아지 데이터로 수정하거나 확장할 수 있습니다
// const dogData = [
//     {
//         id: 1,
//         name: "구름",
//         group: "내향적 강아지",
//         keywords: ["수유동", "수컷", "비숑"],
//         image: "path/to/dog1.jpg" // 실제 이미지 경로로 교체하세요
//     },
//     {
//         id: 2,
//         name: "월이",
//         group: "사자가 되지 못한 라이언",
//         keywords: ["서교동", "수컷", "포메"],
//         image: "path/to/dog2.jpg"
//     },
//     {
//         id: 3,
//         name: "콩이",
//         group: "사자가 되지 못한 라이언",
//         keywords: ["정자동", "암컷", "포메"],
//         image: "path/to/dog3.jpg"
//     },
//     {
//         id: 4,
//         name: "또또",
//         group: "내향적 강아지",
//         keywords: ["상도동", "암컷", "푸들"],
//         image: "path/to/dog4.jpg"
//     },
//     {
//         id: 5,
//         name: "구름",
//         group: "행복 산책 3시간",
//         keywords: ["동백동", "암컷", "시골잡종"],
//         image: "path/to/dog5.jpg"
//     },
//     {
//         id: 6,
//         name: "베리",
//         group: "털 속성 강아지",
//         keywords: ["서초동", "수컷", "골든리트리버"],
//         image: "path/to/dog6.jpg"
//     },
//     {
//         id: 7,
//         name: "체리",
//         group: "장난감 부서",
//         keywords: ["부평동", "암컷", "리트리버"],
//         image: "path/to/dog7.jpg"
//     },
//     {
//         id: 8,
//         name: "송송",
//         group: "다리가 짧아",
//         keywords: ["철산동", "암컷", "웰시코기"],
//         image: "path/to/dog8.jpg"
//     }
// ];

// 강아지 카드 HTML을 생성하는 함수
function createDogCard(dog) {
    return `
                <div class="friend_dog_card">
                    <div class="f_dog_hbtn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="5" height="25" viewBox="0 0 5 25">
                            <g id="그룹_162482" data-name="그룹 162482" transform="translate(-7432 -1784)">
                                <circle id="타원_9356" data-name="타원 9356" cx="2.5" cy="2.5" r="2.5" transform="translate(7432 1784)" fill="#b7b7b7"/>
                                <circle id="타원_9357" data-name="타원 9357" cx="2.5" cy="2.5" r="2.5" transform="translate(7432 1794)" fill="#b7b7b7"/>
                                <circle id="타원_9358" data-name="타원 9358" cx="2.5" cy="2.5" r="2.5" transform="translate(7432 1804)" fill="#b7b7b7"/>
                            </g>
                        </svg>
                    </div>
                    <div class="f_dog_card_cont">
                        <div class="f_dog_img" style="background-image: url('${dog.image}'); background-size: cover; background-position: center;"></div>
                        <p class="f_dog_name">${dog.name}</p>
                        <label class="f_dog_group">${dog.group}</label>
                        <div class="dog_keyword_row">
                            ${dog.keywords.map(keyword => `<label class="dog_keyword">${keyword}</label>`).join('')}
                        </div>
                    </div>
                </div>
            `;
}

// 모든 강아지 카드를 렌더링하는 함수 - 반응형 유지하면서 수정
function renderDogCards(dogs) {
    const contentContainer = document.querySelector('.friend_content');
    contentContainer.innerHTML = '';

    // 카드를 위한 그리드 컨테이너 생성
    const gridContainer = document.createElement('div');
    gridContainer.className = 'dog-grid-container';

    // 검색 여부에 따라 컨테이너 클래스 추가
    const isSearchResult = document.querySelector('.search_type').value !== '' ||
        document.querySelector('.search_friend').value !== '';

    if (isSearchResult) {
        gridContainer.classList.add('search-results');
    } else {
        gridContainer.classList.add('all-results');
    }

    // 모든 카드 추가
    dogs.forEach(dog => {
        const dogCardHTML = createDogCard(dog);
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrapper';
        cardWrapper.innerHTML = dogCardHTML;
        gridContainer.appendChild(cardWrapper);
    });

    contentContainer.appendChild(gridContainer);
}

// 검색 조건에 따라 강아지를 필터링하는 함수
function filterDogs(breed, name) {
    breed = breed.toLowerCase();
    name = name.toLowerCase();

    return dogData.filter(dog => {
        const dogBreed = dog.keywords.find(keyword => keyword.toLowerCase().includes(breed));
        const dogName = dog.name.toLowerCase().includes(name);

        if (breed && name) {
            return dogBreed && dogName;
        } else if (breed) {
            return dogBreed;
        } else if (name) {
            return dogName;
        } else {
            return true;
        }
    });
}

// 검색 입력란에 이벤트 리스너 설정
function setupSearchListeners() {
    const breedSearch = document.querySelector('.search_type');
    const nameSearch = document.querySelector('.search_friend');

    function handleSearch() {
        const breedValue = breedSearch.value;
        const nameValue = nameSearch.value;
        const filteredDogs = filterDogs(breedValue, nameValue);
        renderDogCards(filteredDogs);
    }

    breedSearch.addEventListener('input', handleSearch);
    nameSearch.addEventListener('input', handleSearch);
}

// 페이지 초기화
function initPage() {
    renderDogCards(dogData);
    setupSearchListeners();
}

// DOM이 완전히 로드되면 초기화 실행
document.addEventListener('DOMContentLoaded', initPage);
