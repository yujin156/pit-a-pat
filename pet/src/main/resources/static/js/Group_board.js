// 구글 캘린더 API 설정
const GOOGLE_CONFIG = {
    API_KEY: 'YOUR_GOOGLE_API_KEY', // 실제 API 키로 교체 필요
    CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID', // 실제 클라이언트 ID로 교체 필요
    DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    SCOPES: 'https://www.googleapis.com/auth/calendar'
};

// 캘린더 상태 관리
let calendarState = {
    isSignedIn: false,
    currentDate: new Date(),
    events: [],
    gapi: null,
    apiLoaded: false
};

let posts = []
let deleteImgIds = [];
let isEditMode = false;
let editingCommentCno = null

let currentUserGroupStatus = null; // 현재 사용자의 그룹 내 상태를 저장할 변수 (LEADER, MEMBER, NOT_JOINED)
let currentGno = null; // 현재 보고 있는 그룹의 gno 저장
let selectedDogDnoForBoardApply = null; // 이 페이지의 가입 신청 모달에서 선택된 dno

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.group_board_setting');  // 메뉴 버튼 (SVG)
    const menu = document.getElementById('group_menu'); // 메뉴
    const gno = window.location.pathname.split("/").pop();

    const memberManagementTab = document.querySelector("#member-management");
    const groupBoardWrap = document.querySelector(".group_board_left");

    const boardMemberRow = document.querySelector(".board_member_row");
    const memberManagementContainer = document.querySelector(".member_management_container");

    const commentSubmitBtn = document.querySelector('.comment_submit');
    currentGno = window.location.pathname.split("/").pop();

    loadMyGroupDogs(gno);

    console.log('✅ gno:', gno);

    // "가입대기자/멤버 관리" 클릭 시
    memberManagementTab.addEventListener('click', function() {
        // 게시글 영역 숨기기
        boardMemberRow.style.display = 'none';

        memberManagementContainer.style.display = 'block';
    });

    // "모임 멤버들" 클릭 시
    const memberTab = document.querySelector(".tab_button.active");  // 모임 멤버들 탭을 선택
    memberTab.addEventListener('click', function() {
        // 게시글 영역 보이기
        groupBoard.style.display = 'block';

        // 멤버 관리 영역 숨기기
        memberManagementContainer.style.display = 'none';
    });

    menuButton.addEventListener('click', function() {
        // 메뉴 보이기/숨기기
        if (menu.style.display === "none" || menu.style.display === "") {
            menu.style.display = "block"; // 메뉴 표시
        } else {
            menu.style.display = "none"; // 메뉴 숨기기
        }
    });

    fetch(`/groups/${currentGno}/menu-status`)
        .then(response => {
            if (!response.ok) {
                console.error('menu-status API 호출 실패:', response.status);
                currentUserGroupStatus = "NOT_JOINED";
                if (response.status === 401) {
                    console.log("사용자 로그인되지 않음. 기능 제한.");
                }
                return null;
            }
            return response.json();
        })

        .then(data => {
            if (data) { // response.ok가 아니어서 data가 undefined일 수 있음
                currentUserGroupStatus = data.status; // 전역 변수에 상태 저장
                console.log("Current user group status:", currentUserGroupStatus);

                // 기존 메뉴 버튼 표시 로직 (Leader, Member, Not_Joined에 따라)
                const memberManagement = document.getElementById("member-management");
                const joinGroup = document.getElementById("join-group"); // 사용자님 코드에서는 joinGroup으로 되어 있었습니다.
                const leaveGroup = document.getElementById("leave-group");
                const menu = document.getElementById("group_menu");

                // 모든 버튼과 메뉴를 먼저 숨깁니다.
                if(memberManagement) memberManagement.style.display = "none";
                if(joinGroup) joinGroup.style.display = "none";
                if(leaveGroup) leaveGroup.style.display = "none";
                if(menu) menu.style.display = "none";


                // --- 이 아래부터 사용자님이 제공해주신 코드 스니펫의 시작점과 유사합니다 ---
                if (currentUserGroupStatus === "LEADER") {
                    if(memberManagement) memberManagement.style.display = "block";

                } else if (currentUserGroupStatus === "MEMBER") {
                    if(leaveGroup) leaveGroup.style.display = "block";

                } else if (currentUserGroupStatus === "NOT_JOINED") {
                    if(joinGroup) joinGroup.style.display = "block";
                    const newJoinButton = joinGroup.cloneNode(true);
                    if (joinGroup.parentNode) {
                        joinGroup.parentNode.replaceChild(newJoinButton, joinGroup);
                    } else {
                        console.error("'joinGroup' 버튼의 부모 노드를 찾을 수 없습니다.");
                    }
                    newJoinButton.addEventListener('click', function() {
                        const groupNameElement = document.querySelector('.group_board_title_name');
                        const groupName = groupNameElement ? groupNameElement.textContent : `그룹 (ID: ${currentGno})`;
                        console.log(`"가입하기" 버튼 클릭됨 -> openApplyModalOnBoard(${currentGno}, "${groupName}") 호출`);
                        openApplyModalOnBoard(currentGno, groupName);
                    });
                }
            }
            updateUIAccessBasedOnStatus();
        })
        .catch(error => {
            console.error('메뉴 상태 조회 실패 또는 처리 중 오류:', error);
            currentUserGroupStatus = "NOT_JOINED";
            updateUIAccessBasedOnStatus();
        });

    fetch(`/board/api/groups/${gno}/posts`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            posts = data;
            const container = document.querySelector('.board_member_row');
            posts.forEach((post, index) => {
                const element = createPostElement(post, index);
                container.appendChild(element);
            });
        })
        .catch(error => console.error("게시글 로딩 실패:", error));


    // 폼 submit 이벤트 잡기 (추가!)
    createPostForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this); // 폼의 모든 name 필드를 자동으로 포함
        const url = isEditMode ? '/board/api/update' : '/board/api/create';

        if (isEditMode) {
            // ----- 올바른 수정 모드 로직 시작 -----
            const currentBno = formData.get('bno');
            if (!currentBno || isNaN(parseInt(currentBno))) {
                alert('수정할 게시글을 식별할 수 없습니다. 다시 시도해주세요.');
                return;
            }
            if (deleteImgIds && deleteImgIds.length > 0) {
                deleteImgIds.forEach(id => {
                    formData.append('deleteImgIds', id.toString());
                });
            }
        } else {
            const currentGno = formData.get('gno'); // <input type="hidden" name="gno"> 에서 가져옴
            if (!currentGno) {
                console.error('❌ 새 글 작성 모드인데 gno가 없습니다.');
                alert('그룹 정보를 찾을 수 없습니다. 다시 시도해주세요.');
                return;
            }
            // currentUserGroupStatus를 여기서 한번 더 확인해서 비멤버면 return 하는 방어코드도 좋습니다.
            if (currentUserGroupStatus !== "LEADER" && currentUserGroupStatus !== "MEMBER") {
                alert("그룹 멤버만 게시글을 작성할 수 있습니다.");
                return;
            }
        }

        for (let pair of formData.entries()) {
        }

        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        let errorData = text;
                        try { errorData = JSON.parse(text); } catch (e) {}
                        throw errorData;
                    });
                }
                return response.text();
            })
            .then(data => {
                console.log(isEditMode ? '✅ 게시글 수정 성공' : '✅ 게시글 작성 성공', data);
                hideCreatePostModal();
                const currentGnoForReload = formData.get('gno') || window.location.pathname.split("/").pop();
                fetch(`/board/api/groups/${currentGnoForReload}/posts`)
                    .then(res => res.json())
                    .then(updatedPosts => {
                        posts = updatedPosts;
                        createPosts();
                    })
                    .catch(err => console.error("게시글 목록 업데이트 실패:", err));

                showSuccessMessage(isEditMode ? '게시글이 성공적으로 수정되었습니다! 🎉' : '게시글이 성공적으로 작성되었습니다! 🎉');
                deleteImgIds = [];
                if (isEditMode) isEditMode = false;
            })
            .catch(error => {
                console.error(isEditMode ? '❌ 게시글 수정 실패:' : '❌ 게시글 작성 실패:', error);
                let errorMessage = isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.';
                if (typeof error === 'string') {
                    errorMessage += `\n서버 메시지: ${error}`;
                } else if (error && error.message) {
                    errorMessage += `\n오류: ${error.message}`;
                } else if (typeof error === 'object') {
                    errorMessage += `\n상세: ${JSON.stringify(error)}`;
                }
                alert(errorMessage);
            });

    });


    console.log('🚀 페이지 로드 완료 - 초기화 시작');

    function loadMyGroupDogs(gno) {
        console.log('✅ loadMyGroupDogs - gno:', gno);
        fetch(`/board/api/my-group-dogs?gno=${gno}`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('dno');
                select.innerHTML = '<option value="">-- 선택하세요 --</option>';
                data.forEach(dog => {
                    const option = document.createElement('option');
                    option.value = dog.dno;
                    option.textContent = dog.dname;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error('❌ 강아지 목록 불러오기 실패:', error));
    }

    function setEditImage(imageUrl, imgId) {
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = imageUrl;
            imagePreview.style.display = 'block';
            imagePreview.dataset.imgId = imgId; // ← PK 저장
        }
    }

    // 게시물 생성
    createPosts();

    // 캘린더 즉시 초기화 (API 없이)
    initializeCalendarImmediate();

    // 구글 API 초기화 (비동기)
    initializeGoogleAPI();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 캘린더 즉시 초기화 함수
    function initializeCalendarImmediate() {
        console.log('📅 캘린더 즉시 초기화 시작');
        renderCalendarNow();
        renderBasicEventsList();
    }

    // 캘린더 즉시 렌더링
    function renderCalendarNow() {
        const calendarDates = document.getElementById('calendarDates');
        const currentMonth = document.getElementById('currentMonth');

        console.log('📅 캘린더 요소 확인:', {
            calendarDates: !!calendarDates,
            currentMonth: !!currentMonth
        });

        if (!calendarDates || !currentMonth) {
            console.error('❌ 캘린더 요소를 찾을 수 없습니다');
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        currentMonth.textContent = `${year}년 ${month + 1}월`;
        console.log(`📅 현재 월 설정: ${year}년 ${month + 1}월`);

        // 월의 첫 날과 마지막 날
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // 달력 시작 날짜 (일요일부터 시작)
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - firstDay.getDay());

        calendarDates.innerHTML = '';
        console.log('📅 날짜 생성 시작...');

        // 6주 * 7일 = 42개 날짜 생성
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dateElement = document.createElement('div');
            dateElement.className = 'calendar_date';
            dateElement.textContent = currentDate.getDate();

            // 현재 월이 아닌 날짜는 흐리게
            if (currentDate.getMonth() !== month) {
                dateElement.classList.add('other_month');
            }

            // 오늘 날짜 하이라이트
            if (isToday(currentDate)) {
                dateElement.classList.add('today');
                console.log('✅ 오늘 날짜 표시:', currentDate.getDate());
            }

            // 클릭 이벤트 추가
            dateElement.addEventListener('click', function() {
                console.log('날짜 클릭:', currentDate.getDate());
            });

            calendarDates.appendChild(dateElement);
        }

        console.log('✅ 캘린더 날짜 생성 완료 - 42개 날짜 표시');
    }

    // 오늘 날짜 확인 함수
    function isToday(date) {
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
    }

    // 게시물 생성 함수
    function createPosts() {
        const leftContainer = document.querySelector('.group_board_left');
        const existingPosts = document.querySelectorAll('.group_board');

        // 기존 게시물 모두 제거
        existingPosts.forEach(post => post.remove());

        // for문으로 게시물 생성
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const postElement = createPostElement(post, i);
            leftContainer.appendChild(postElement);
        }
    }

    // 개별 게시물 요소 생성 함수
    function createPostElement(post, index) {
        const postDiv = document.createElement('div');
        postDiv.className = 'group_board';
        postDiv.setAttribute('data-post-id', post.bno);

        // const imageUrl = post.images.map(url => `<img src="${url}" alt="첨부 이미지" class="modal_main_image"/>`).join('');

        let displayImageUrl = ''; // 표시될 최종 이미지 HTML
        // post.images 배열이 존재하고, 비어있지 않은 경우에만 첫 번째 이미지 사용
        if (post.images && post.images.length > 0) {
            const firstImageUrl = post.images[0]; // 배열의 첫 번째 URL만 가져옴
            // URL 유효성 검사 (옵션이지만, 안전성을 위해 추가)
            if (typeof firstImageUrl === 'string' && firstImageUrl.startsWith('/uploads/img/')) {
                displayImageUrl = `<img src="${firstImageUrl}" alt="첨부 이미지" class="modal_main_image" onerror="this.onerror=null;this.src='/uploads/img/default.jpg'"/>`;
            }
        }

        const dogName = post.writerDogName || '알 수 없음';
        console.log('🐞 createPostElement post:', post);
        postDiv.innerHTML = `
            <div class="group_boar_post_writer">
                <div class="group_board_writer">
                    <div class="post_user_info">
                        <div class="post_profile_img">
                            <img src="${post.userProfile}" alt="${post.writerDogName}" onerror="this.src='https://picsum.photos/40/40'"">
                        </div>
                        <div class="post_user_details">
                            <div class="board_write_user">${post.writerDogName}</div>
                            <span class="board_write_time">${post.timeAgo}</span>
                        </div>
                    </div>
                    <div class="post_menu_btn">
                        <svg class="post_menu_toggle" xmlns="http://www.w3.org/2000/svg" width="5" height="23" viewBox="0 0 5 23">
                          <g id="그룹_162502" data-name="그룹 162502" transform="translate(-9196 -5930)">
                            <circle id="타원_9374" data-name="타원 9374" cx="2.5" cy="2.5" r="2.5" transform="translate(9196 5930)" fill="#b7b7b7"/>
                            <circle id="타원_9375" data-name="타원 9375" cx="2.5" cy="2.5" r="2.5" transform="translate(9196 5939)" fill="#b7b7b7"/>
                            <circle id="타원_9376" data-name="타원 9376" cx="2.5" cy="2.5" r="2.5" transform="translate(9196 5948)" fill="#b7b7b7"/>
                          </g>
                        </svg>
                        
                        <div class="post_menu_options">
                           <button class="edit_post_btn">수정</button>
                           <button class="delete_post_btn">삭제</button>
                        </div>
                    </div>
                </div>
                    <div class="board_post_img" data-post-index="${index}">
                        ${displayImageUrl}
                    </div>
                <div class="board_svg_row">
                    <div class="post_right_nav">
                        <div class="post_heart_icon" data-post-index="${index}">
                            <!-- SVG 좋아요 아이콘 -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="43.511" height="38.931" viewBox="0 0 43.511 38.931">
                              <path id="heart" d="M12.235,2.014a10.519,10.519,0,0,0-8.057,3C-.164,9.362.29,16.664,4.936,21.316L6.421,22.8,19.907,36.3a1.446,1.446,0,0,0,2.042,0L35.431,22.8l1.484-1.484c4.646-4.652,5.1-11.953.752-16.3s-11.629-3.885-16.273.764l-.469.469-.469-.469A12.614,12.614,0,0,0,12.235,2.014Z" transform="translate(0.831 0.005)" fill="none" stroke="#b7b7b7" stroke-width="4"/>
                            </svg>

                        </div>
                        <div class="post_comment_icon" data-post-index="${index}">
                            <!-- SVG 댓글 아이콘 -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="39.506" height="39.452" viewBox="0 0 39.506 39.452">
                              <path id="chat" d="M13.862,19.752a1.972,1.972,0,1,0,1.973,1.972A1.972,1.972,0,0,0,13.862,19.752Zm7.89,0a1.972,1.972,0,1,0,1.973,1.972A1.972,1.972,0,0,0,21.753,19.752Zm7.89,0a1.972,1.972,0,1,0,1.973,1.972A1.972,1.972,0,0,0,29.643,19.752ZM21.753,2A19.725,19.725,0,0,0,2.027,21.725,19.508,19.508,0,0,0,6.485,34.211L2.54,38.156A1.923,1.923,0,0,0,4,41.45H21.753a19.725,19.725,0,1,0,0-39.45Zm0,35.5h-13l1.834-1.834a1.93,1.93,0,0,0,0-2.781A15.78,15.78,0,1,1,21.753,37.5Z" transform="translate(-1.972 -2)" fill="#b7b7b7"/>
                            </svg>

                        </div>
                    </div>
                    <div class="post_bookmark_icon" data-post-index="${index}">
                        <!-- SVG 북마크 아이콘 -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="33.069" height="44.093" viewBox="0 0 33.069 44.093">
                          <g id="bookmark" fill="none">
                            <path d="M30.314,0H2.756A2.756,2.756,0,0,0,0,2.756V41.337a2.756,2.756,0,0,0,4.477,2.152l12.057-9.646,12.057,9.646a2.756,2.756,0,0,0,4.477-2.152V2.756A2.756,2.756,0,0,0,30.314,0Z" stroke="none"/>
                            <path d="M 4.000003814697266 4 L 4.000003814697266 38.74836730957031 L 16.53466415405273 28.72048950195312 L 29.06933403015137 38.74837112426758 L 29.06933403015137 4 L 4.000003814697266 4 M 2.755783081054688 0 L 30.31355285644531 0 C 31.83553314208984 0 33.06933212280273 1.233798980712891 33.06933212280273 2.755779266357422 L 33.06933212280273 41.336669921875 C 33.06952285766602 42.3961296081543 32.46233367919922 43.36188125610352 31.5074634552002 43.82088088989258 C 30.55259323120117 44.27988052368164 29.41913414001465 44.15082931518555 28.59188270568848 43.48892974853516 L 16.53466415405273 33.84302139282227 L 4.477453231811523 43.48892974853516 C 3.650121688842773 44.15053176879883 2.516819000244141 44.2794075012207 1.561862945556641 43.82038116455078 C 0.6071434020996094 43.36135101318359 3.814697265625e-06 42.39577102661133 3.814697265625e-06 41.336669921875 L 3.814697265625e-06 2.755779266357422 C 3.814697265625e-06 1.233798980712891 1.233802795410156 0 2.755783081054688 0 Z" stroke="none" fill="#b8b8b8"/>
                          </g>
                        </svg>

                    </div>
                </div>
                <div class="post_content_section">
                    <span class="post_who_like"><!-- 여기다가 누구누구 외 몇명 좋아함 넣을것 --></span>
                    <div class="post_content">
                        <span class="post_username">${post.writerDogName}</span>
                        <span class="post_text">${post.bcontent}</span>
                    </div>
                    <span class="post_comment_count">
                        댓글 ${post.commentCount}개 모두 보기
                    </span>
                </div>
            </div>
        `;

        return postDiv;
    }

    // 모달 생성 함수
    function createModal(post, index, comments) {
        const modal = document.createElement('div');
        const imagesHtml = post.images.map(url => `<img src="${url}" alt="첨부 이미지" class="modal_main_image"/>`).join('');
        const comment = comments[index];

        const profileUrl = comment?.profileUrl || '/images/default_profile.jpg';
        const dogName = comment?.dogName || '알 수 없음';

        modal.className = 'post_modal';
        modal.innerHTML = `
            <div class="modal_overlay">
                <div class="modal_content">
                    <div class="modal_close">&times;</div>
                    <div class="modal_left">
                        <div class="modal_image">
                            ${imagesHtml}
                        </div>
                    </div>
                    <div class="modal_right">
                        <div class="modal_header">
                            <div class="modal_user_info">
                                <div class="modal_profile">
                                    <img src="${profileUrl}" alt="${dogName}">
                                </div>
                                <div class="modal_user_details">
                                    <div class="modal_username">${post.writerDogName}</div>
                                    <div class="modal_time">${post.timeAgo}</div>
                                </div>
                            </div>
                            <div class="modal_menu_btn">⋮</div>
                        </div>
                        <div class="modal_content_area">
                            <div class="modal_post_content">
                                <div class="modal_profile_small">
                                    <img src="${profileUrl}" alt="${dogName}">
                                </div>
                                <div class="modal_text">
                                    <span class="modal_post_username">${post.writerDogName}</span>
                                    <span class="modal_post_text">${post.bcontent}</span>
                                    
                                </div>
                            </div>
                            <div class="modal_comments">
                            </div>
                            <div class="modal_likes"></div>
                            <div class="modal_comment_input">
                                <input type="text" placeholder="댓글 달기..." class="comment_input">
                                <button class="comment_submit">게시</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    // 모달 열기 함수
    function openModal(postIndex) {
        const post = posts[postIndex];
        // ✅ 1️⃣ 먼저 댓글을 fetch로 가져옴
        fetch(`/board/api/comments/${post.bno}`)
            .then(response => response.json())
            .then(comments => {

                const modal = createModal(post, postIndex, comments);
                modal.setAttribute('data-bno', post.bno);
                modal.setAttribute('data-gno', post.gno);
                document.body.appendChild(modal);


                const commentInputAreaInModal = modal.querySelector('.modal_comment_input');
                if (commentInputAreaInModal) {
                    if (currentUserGroupStatus === "LEADER" || currentUserGroupStatus === "MEMBER") {
                        commentInputAreaInModal.style.display = 'block'; // 또는 원래대로
                        // const inputField = commentInputAreaInModal.querySelector('.comment_input');
                        // if (inputField) inputField.disabled = false;
                    } else {
                        commentInputAreaInModal.style.display = 'none'; // 숨기기
                        // const inputField = commentInputAreaInModal.querySelector('.comment_input');
                        // if (inputField) {
                        //     inputField.disabled = true;
                        //     inputField.placeholder = "그룹 멤버만 댓글 작성이 가능합니다.";
                        // }
                    }
                }

                const commentCountElement = document.querySelector(`.post_comment_count[data-post-id="${post.bno}"]`);
                if (commentCountElement) {
                    commentCountElement.textContent = `댓글 ${comments.length}개 모두 보기`;
                }

                const commentContainer = modal.querySelector('.modal_comments');
                commentContainer.innerHTML = '';
                comments.forEach(comment => {
                    const commentItem = document.createElement('div');
                    commentItem.classList.add('comment_item');
                    commentItem.setAttribute('data-cno', comment.bcno);

                    const commenterDogName = (comment.dog && comment.dog.dname) ? comment.dog.dname : '알 수 없음';
                    const commenterProfileUrl = (comment.dog && comment.dog.profileImg) ? comment.dog.profileImg : '/images/default_profile.jpg'; // 프로필 이미지도 dog 객체 안에 있을 수 있습니다. 서버 데이터 확인 필요
                    const commentText = comment.bccomment || '';


                    commentItem.innerHTML = `
                    <div class="comment_profile">
                        <img src="${commenterProfileUrl}" alt="${commenterDogName}" onerror="this.src='https://picsum.photos/30/30'">
                    </div>
                    <div class="comment_text">
                        <span class="comment_username">${commenterDogName}</span>
                        <span>${commentText}</span>
                        <span class="comment_menu_btn">
                            <svg class="comment_menu_toggle" width="24" height="24" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                            </svg>
                            <div class="comment_menu_options" style="display:none;">
                                <button class="edit-comment-btn">수정</button>
                                <button class="delete-comment-btn">삭제</button>
                            </div>
                        </span>
                    </div>
                `;
                    commentContainer.appendChild(commentItem);
                });

                // ✅ 나머지 기존 모달 처리 로직 (댓글 이후에 실행)
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                document.body.style.overflow = 'hidden';

                const closeBtn = modal.querySelector('.modal_close');
                const overlay = modal.querySelector('.modal_overlay');

                const closeModal = () => {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                        document.body.style.overflow = 'auto';
                    }, 300);
                };

                closeBtn.addEventListener('click', closeModal);
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        closeModal();
                    }
                });

                const escHandler = (e) => {
                    if (e.key === 'Escape') {
                        closeModal();
                        document.removeEventListener('keydown', escHandler);
                    }
                };
                document.addEventListener('keydown', escHandler);

                const modalHeartIcon = modal.querySelector('.modal_heart_icon');
                const modalBookmarkIcon = modal.querySelector('.modal_bookmark_icon');

                if (modalHeartIcon) {
                    modalHeartIcon.addEventListener('click', function() {
                        const index = this.getAttribute('data-post-index');
                        toggleLike(index);
                        updateModalLikeState(modal, index);
                    });
                }

                if (modalBookmarkIcon) {
                    modalBookmarkIcon.addEventListener('click', function() {
                        const index = this.getAttribute('data-post-index');
                        toggleBookmark(index);
                        updateModalBookmarkState(modal, index);
                    });
                }
            })
            .catch(err => console.error('❌ 댓글 로드 실패:', err));
    }

    document.addEventListener('click', function(e) {

        if (e.target.classList.contains('edit-comment-btn')) {
            const commentItem = e.target.closest('.comment_item');
            const cno = commentItem.getAttribute('data-cno');
            const textSpan = commentItem.querySelector('.comment_text span:nth-child(2)');
            const oldText = textSpan.textContent;
            const modal = e.target.closest('.post_modal');
            const input = modal.querySelector('.comment_input');
            input.value = oldText;
            input.focus();
            editingCommentCno = cno;
            input.placeholder = '댓글 수정중...';
        }

        if (e.target.closest('.comment_menu_toggle')) {
            // 메뉴 토글
            const menu = e.target.closest('.comment_menu_btn').querySelector('.comment_menu_options');
            // 모든 메뉴 닫기
            document.querySelectorAll('.comment_menu_options').forEach(m => m.style.display = 'none');
            // 현재 것만 토글
            menu.style.display = (menu.style.display === 'block' ? 'none' : 'block');
            e.stopPropagation();
        } else {
            // 바깥 클릭 시 메뉴 닫기
            document.querySelectorAll('.comment_menu_options').forEach(m => m.style.display = 'none');
        }

        // 댓글 입력/수정 문제

        if (e.target.classList.contains('comment_submit')) {
            const modal = e.target.closest('.post_modal');
            const input = modal.querySelector('.comment_input');
            const content = input.value.trim();
            if (!content) {
                alert('댓글 내용을 입력하세요!');
                return;
            }

            // 수정모드일 때 (editingCommentCno 값이 있으면)
            if (editingCommentCno) {
                const modal = e.target.closest('.post_modal');
                fetch(`/board/comment/api/comments/${editingCommentCno}`, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({content})
                })
                    .then(res => {
                        if (res.ok) {
                            // 수정한 댓글 DOM에서 텍스트만 갱신
                            const commentItem = modal.querySelector(`.comment_item[data-cno="${editingCommentCno}"]`);
                            if (commentItem) {
                                commentItem.querySelector('.comment_text span:nth-child(2)').textContent = content;
                            }
                            // 수정모드 초기화
                            editingCommentCno = null;
                            input.value = '';
                            input.placeholder = '댓글 달기...';
                        } else {
                            alert("댓글 수정 실패");
                        }
                    })
                    .catch(err => alert('댓글 수정 오류'));
            }
            // 새 댓글 등록(POST)
            else {
                const modal = e.target.closest('.post_modal');
                const bno = modal.getAttribute('data-bno');
                const dno = modal.getAttribute('data-dno');
                const gno = modal.getAttribute('data-gno');
                // 'content' 변수는 이 스코프 어딘가에서 이미 값을 가지고 있어야 합니다.
                // const content = input.value.trim(); 와 같이요.

                // 👇👇👇 이 로그들을 반드시 추가하고 확인해주세요! 👇👇👇
                console.log("--- 댓글 전송 직전 값 확인 ---");
                console.log("bno:", bno);
                console.log("dno:", dno);
                console.log("content:", content); // content 변수가 정의된 부분 확인 필요
                console.log("gno (from modal.getAttribute('data-gno')):", gno);
                console.log("-----------------------------");

                if (!gno) { // 만약을 위한 방어 코드 (이전에 넣으셨다면 그대로 두세요)
                    alert('자바스크립트: gno 값이 없습니다! 모달의 data-gno 속성을 확인하세요.');
                    console.error('자바스크립트: gno is null or undefined before fetch.');
                    return;
                }
                // bno에 대한 방어 코드도 필요하다면 추가하세요.

                fetch('/board/api/comments', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        bno: bno,
                        dno: dno,
                        content: content,
                        gno: gno
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        input.value = '';
                        input.placeholder = '댓글 달기...';
                        const commentsDiv = modal.querySelector('.modal_comments');
                        const commentHtml = `
                <div class="comment_item" data-cno="${data.bcno}">
                    <div class="comment_profile">
                        <img src="/img/default-profile.jpg" alt="user">
                    </div>
                    <div class="comment_text">
                        <span class="comment_username">${data.dogName}</span>
                        <span>${data.bccomment}</span>
                        <span class="comment_menu_btn">
                            <svg class="comment_menu_toggle" width="24" height="24" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                            </svg>
                            <div class="comment_menu_options" style="display:none;">
                                <button class="edit-comment-btn">수정</button>
                                <button class="delete-comment-btn">삭제</button>
                            </div>
                        </span>
                    </div>
                </div>`;
                        commentsDiv.innerHTML += commentHtml;
                    })
                    .catch(err => {
                        console.error('❌ 댓글 등록 실패:', err);
                        alert('댓글 등록에 실패했습니다.');
                    });
            }
        }

        // 댓글 삭제
        if (e.target.classList.contains('delete-comment-btn')) {
            const commentItem = e.target.closest('.comment_item');
            const cno = commentItem.getAttribute('data-cno');

            console.log("삭제 클릭: ", commentItem, cno);

            if (confirm("정말 삭제하시겠습니까?")) {
                fetch(`/board/comment/api/comments/${cno}`, { method: "DELETE" })
                    .then(res => {
                        if (res.ok) commentItem.remove();
                        else alert("삭제 실패");
                    });
            }
        }


        // 메뉴 토글 (SVG 버튼 클릭 시)
        if (e.target.closest('.post_menu_toggle')) {
            const menu = e.target.closest('.post_menu_btn').querySelector('.post_menu_options');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }

        // 게시글 수정
        if (e.target.classList.contains('edit_post_btn')) {
            isEditMode = true; // 수정 모드 켜기

            // 1️⃣ 클릭한 게시글 div (부모 .group_board) 찾기
            const postElement = e.target.closest('.group_board');

            // 2️⃣ 거기서 data-post-id로 bno 가져오기
            const bno = postElement.getAttribute('data-post-id');
            console.log('✅ 수정할 게시글 번호 (bno):', bno);

            // 3️⃣ 모달 열기 전에 bno hidden input에 채우기
            const bnoInput = document.getElementById('bno');
            if (bnoInput) {
                bnoInput.value = bno;
            }

            // 4️⃣ 서버에서 수정할 게시글의 모든 데이터 가져오기
            fetch(`/board/api/post/${bno}`)
                .then(res => res.json())
                .then(data => {
                    console.log('✅ 불러온 수정용 데이터:', data);
                    console.log('‼️ data.gno 값 확인:', data.gno);

                    const gnoInput = document.querySelector('input[name="gno"]');
                    if (gnoInput) {
                        if (data.gno === null || typeof data.gno === 'undefined') {
                            console.error("🔥 data.gno가 null 또는 undefined입니다! 이로 인해 문제가 발생할 수 있습니다.");
                            // gnoInput.value = ''; // 또는 기본값 설정, 또는 제출 방지
                        } else {
                            gnoInput.value = data.gno;
                        }
                    }

                    // 글 내용
                    const contentInput = document.getElementById('postContent');
                    if (contentInput) {
                        contentInput.value = data.bcontent || '';
                    }

                    if (data.images && data.images.length > 0 && data.imageIds && data.imageIds.length > 0) {
                        console.log("setEditImage 호출! imgId:", data.imageIds[0]);
                        setEditImage(data.images[0], data.imageIds[0]);
                    } else {
                        console.warn("이미지 PK가 없음. imageIds:", data.imageIds);
                    }

                    // 이미지 미리보기
                    const imagePreview = document.getElementById('imagePreview');
                    const imageUploadPlaceholder = document.getElementById('imageUploadPlaceholder');
                    const imageActions = document.getElementById('imageActions');

                    if (imagePreview && data.images && data.images.length > 0) {
                        imagePreview.src = data.images[0];
                        imagePreview.style.display = 'block';
                        if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'none'; // ✅ 이 줄!
                        if (imageActions) imageActions.style.display = 'flex'; // 이미지가 있을 때 액션 버튼 보여주기
                    } else if (imagePreview) {
                        imagePreview.style.display = 'none';
                        if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'flex'; // ✅ 이 줄!
                        if (imageActions) imageActions.style.display = 'none';
                    }
                    if (data.images && data.images.length > 0 && data.imageIds && data.imageIds.length > 0) {
                        setEditImage(data.images[0], data.imageIds[0]);
                        if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'none';
                        if (imageActions) imageActions.style.display = 'flex';
                    }

                    // 그룹번호(gno) 채우기
                    // const gnoInput = document.querySelector('input[name="gno"]');
                    // if (gnoInput) gnoInput.value = data.gno;

                    // 강아지 선택
                    const dnoSelect = document.getElementById('dno');
                    if (dnoSelect && data.dno) {
                        dnoSelect.value = data.dno;
                    }

                    // 5️⃣ 모달 열기
                    showCreatePostModal(data.gno, true, bno); // true = 수정 모드!
                })
                .catch(err => {
                    console.error('❌ 게시글 불러오기 실패:', err);
                    alert('게시글 정보를 불러오는데 실패했습니다.');
                });
        }


        // 게시글 삭제
        if (e.target.classList.contains('delete_post_btn')) {
            const postId = e.target.closest('.group_board').getAttribute('data-post-id');
            if (confirm('정말 삭제하시겠습니까?')) {
                fetch(`/board/api/delete?bno=${postId}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            alert('삭제 완료!');
                            location.reload();
                        } else {
                            alert('삭제 실패');
                        }
                    })
                    .catch(err => {
                        console.error('❌ 삭제 요청 실패:', err);
                        alert('서버 오류로 삭제 실패!');
                    });
            }
        }

        // 메뉴 외부 클릭 시 메뉴 닫기
        if (!e.target.closest('.post_menu_btn')) {
            document.querySelectorAll('.post_menu_options').forEach(menu => {
                menu.style.display = 'none';
            });
        }

        // 게시물 이미지 클릭 시 모달 열기
        if (e.target.classList.contains('board_post_img') || e.target.closest('.board_post_img')) {
            const postElement = e.target.closest('.board_post_img');
            if (postElement) {
                const postIndex = postElement.getAttribute('data-post-index');
                if (postIndex !== null) {
                    openModal(parseInt(postIndex));
                }
            }
        }


        // 좋아요 버튼 클릭
        if (e.target.closest('.post_heart_icon')) {
            const heartIcon = e.target.closest('.post_heart_icon');
            const index = heartIcon.getAttribute('data-post-index');
            if (index !== null) {
                toggleLike(parseInt(index));

                // 애니메이션 효과
                heartIcon.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    heartIcon.style.transform = 'scale(1)';
                }, 200);
            }
        }

        // 북마크 버튼 클릭
        if (e.target.closest('.post_bookmark_icon')) {
            const bookmarkIcon = e.target.closest('.post_bookmark_icon');
            const index = bookmarkIcon.getAttribute('data-post-index');
            if (index !== null) {
                toggleBookmark(parseInt(index));

                // 애니메이션 효과
                bookmarkIcon.style.transform = 'scale(1.2) rotate(10deg)';
                setTimeout(() => {
                    bookmarkIcon.style.transform = 'scale(1) rotate(0deg)';
                }, 300);
            }
        }

        // 댓글 아이콘 클릭
        if (e.target.closest('.post_comment_icon')) {
            const commentIcon = e.target.closest('.post_comment_icon');
            const index = commentIcon.getAttribute('data-post-index');
            if (index !== null) {
                openModal(parseInt(index));

                // 클릭 애니메이션
                commentIcon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    commentIcon.style.transform = 'scale(1)';
                }, 150);
            }
        }
        const addPostBtn = e.target.closest('.add_post_btn');

        if (addPostBtn) {
            const groupId = addPostBtn.getAttribute('data-group-id');
            isEditMode = false; // 여기!!

            console.log('✅ groupId (위임방식):', groupId);

            // ✅ 방어코드: groupId가 없으면 중단
            if (!groupId || groupId === 'undefined') {
                console.warn('⚠️ groupId가 undefined거나 비어있습니다. 요청 중단!');
                return;
            }

            showCreatePostModal(groupId, false);
        }

    });

    // 게시물 이미지 더블클릭 좋아요
    document.addEventListener('dblclick', function(e) {
        if (e.target.classList.contains('board_post_img') || e.target.closest('.board_post_img')) {
            const postElement = e.target.closest('.board_post_img');
            if (postElement) {
                const index = postElement.getAttribute('data-post-index');
                if (index !== null) {
                    posts[parseInt(index)].liked = true;
                    updatePostLikeState(parseInt(index));

                    // 하트 이펙트 생성
                    createHeartEffect(postElement);
                }
            }
        }
    });

    // 좋아요 토글 함수
    function toggleLike(index) {
        const post = posts[index];
        const bno = post.bno;

        fetch(`/board/${bno}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `dno=${post.dno || ''}`
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    post.liked = data.isLiked;
                    updatePostLikeState(index);
                } else {
                    alert(data.message || '좋아요 실패');
                }
            })
            .catch(err => console.error('❌ 좋아요 요청 실패:', err));
    }

    //북마크
    function toggleBookmark(index) {
        const post = posts[index];
        const bno = post.bno;

        fetch(`/board/${bno}/bookmark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `dno=${post.dno || ''}`
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    post.bookmarked = data.isBookmarked;
                    updatePostBookmarkState(index);
                } else {
                    alert(data.message || '북마크 실패');
                }
            })
            .catch(err => console.error('❌ 북마크 요청 실패:', err));
    }

    // 게시물 좋아요 상태 업데이트
    function updatePostLikeState(index) {
        const heartIcons = document.querySelectorAll(`[data-post-index="${index}"].post_heart_icon`);
        heartIcons.forEach(icon => {
            if (posts[index].liked) {
                icon.classList.add('liked');
            } else {
                icon.classList.remove('liked');
            }
        });
    }

    // 게시물 북마크 상태 업데이트
    function updatePostBookmarkState(index) {
        const bookmarkIcons = document.querySelectorAll(`[data-post-index="${index}"].post_bookmark_icon`);
        bookmarkIcons.forEach(icon => {
            if (posts[index].bookmarked) {
                icon.classList.add('bookmarked');
            } else {
                icon.classList.remove('bookmarked');
            }
        });
    }

    // 모달 내 좋아요 상태 업데이트
    function updateModalLikeState(modal, index) {
        const heartIcon = modal.querySelector('.modal_heart_icon');
        if (posts[index].liked) {
            heartIcon.classList.add('liked');
        } else {
            heartIcon.classList.remove('liked');
        }
    }

    // 모달 내 북마크 상태 업데이트
    function updateModalBookmarkState(modal, index) {
        const bookmarkIcon = modal.querySelector('.modal_bookmark_icon');
        if (posts[index].bookmarked) {
            bookmarkIcon.classList.add('bookmarked');
        } else {
            bookmarkIcon.classList.remove('bookmarked');
        }
    }

    // 하트 이펙트 생성 함수
    function createHeartEffect(element) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'absolute';
        heart.style.fontSize = '30px';
        heart.style.top = '50%';
        heart.style.left = '50%';
        heart.style.transform = 'translate(-50%, -50%)';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '1000';
        heart.style.animation = 'heartPop 0.8s ease-out forwards';

        element.style.position = 'relative';
        element.appendChild(heart);

        // 애니메이션 후 제거
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 800);
    }

    // 게시글 추가 버튼 클릭 이벤트
    // const addPostBtn = document.querySelector('.add_post_btn');
    // if (addPostBtn) {
    //     addPostBtn.addEventListener('click', function() {
    //         console.log('📝 게시글 작성 모달 열기');
    //         const groupId = this.getAttribute('data-group-id'); // 예를 들어 data-group-id 속성으로 받아오도록!
    //         showCreatePostModal(groupId);
    //
    //         // 클릭 애니메이션
    //         this.style.transform = 'scale(0.95)';
    //         setTimeout(() => {
    //             this.style.transform = 'scale(1)';
    //         }, 100);
    //     });
    // }

    // 게시글 작성 모달 관련 함수들
    function showCreatePostModal(groupId, editMode = false, bno = null) {
        isEditMode = editMode;
        const modal = document.getElementById('createPostModal');

        if (modal) {
            console.log('✅ showCreatePostModal groupId:', groupId);
            loadMyGroupDogs(groupId);

            // ⭐️ 작성/수정에 따라 textarea name 바꾸기
            const postContent = document.getElementById('postContent');
            if (postContent) {
                if (isEditMode) {
                    postContent.setAttribute('name', 'newContent');
                } else {
                    postContent.setAttribute('name', 'content');
                }
                console.log('✅ textarea name 속성:', postContent.getAttribute('name'));
            }

            // 🪄 gno 채우기
            const gnoInput = modal.querySelector('input[name="gno"]');
            if (gnoInput) {
                gnoInput.value = groupId;
            }

            // bno 처리도 여기에...
            const bnoInput = modal.querySelector('input[name="bno"]');
            if (bnoInput) {
                if (isEditMode && bno) {
                    bnoInput.value = bno;
                } else {
                    bnoInput.value = '';
                }
            }

            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            document.body.style.overflow = 'hidden';

            if (!isEditMode) {
                resetCreatePostForm();
            }

            setupCreatePostModalEvents();
        }
    }


    function hideCreatePostModal() {
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    function resetCreatePostForm() {
        // 폼 필드 초기화
        const postContent = document.getElementById('postContent');
        if (postContent) postContent.value = '';

        // 이미지 초기화
        const imagePreview = document.getElementById('imagePreview');
        const imageUploadPlaceholder = document.getElementById('imageUploadPlaceholder');
        const imageActions = document.getElementById('imageActions');
        const imageUpload = document.getElementById('imageUpload');

        if (imagePreview) imagePreview.style.display = 'none';
        if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'flex';
        if (imageActions) imageActions.style.display = 'none';
        if (imageUpload) imageUpload.value = '';

        // 게시하기 버튼 상태 초기화
        updateSaveButtonState();
    }

    function setupCreatePostModalEvents() {
        // 모달 닫기 이벤트들
        const closeBtn = document.getElementById('closeCreatePostModal');
        const cancelBtn = document.getElementById('cancelCreatePost');
        const modalOverlay = document.querySelector('#createPostModal .modal_overlay');

        const closeModal = () => hideCreatePostModal();

        if (closeBtn) {
            closeBtn.removeEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.removeEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }

        // 이미지 업로드 이벤트들
        setupImageUploadEvents();

        // 텍스트 입력 이벤트들
        setupTextInputEvents();

        // 게시하기 버튼 이벤트
        const saveBtn = document.getElementById('saveCreatePost');
        if (saveBtn) {
            // saveBtn.removeEventListener('click', handleCreatePost);
            // saveBtn.addEventListener('click', handleCreatePost);
            saveBtn.replaceWith(saveBtn.cloneNode(true));
        }
    }

    function setupImageUploadEvents() {
        const imageUpload = document.getElementById('imageUpload');
        const imageUploadPlaceholder = document.getElementById('imageUploadPlaceholder');
        const changeImageBtn = document.getElementById('changeImageBtn');
        const removeImageBtn = document.getElementById('removeImageBtn');
        const previewContainer = document.getElementById('imagePreviewContainer');

        if (imageUpload && imageUpload.files.length > 0) {
            console.log('이미지 파일 선택됨:', imageUpload.files);
        } else {
            console.log('이미지 파일이 선택되지 않았습니다');
        }

        // 플레이스홀더 클릭 시 파일 선택
        if (imageUploadPlaceholder) {
            imageUploadPlaceholder.addEventListener('click', () => {
                if (imageUpload) imageUpload.click();
            });
        }

        // 이미지 변경 버튼
        if (changeImageBtn) {
            changeImageBtn.addEventListener('click', () => {
                if (imageUpload) imageUpload.click();
            });
        }

        // 이미지 제거 버튼
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                const imagePreview = document.getElementById('imagePreview');
                console.log('remove 클릭 - imgId:', imagePreview?.dataset.imgId); // 추가
                if (isEditMode && imagePreview && imagePreview.dataset.imgId) {
                    if (!deleteImgIds.includes(imagePreview.dataset.imgId)) {
                        deleteImgIds.push(imagePreview.dataset.imgId);
                    }
                    console.log('삭제할 PK 리스트:', deleteImgIds); // 추가
                }
                resetImageUpload();
            });
        }

        // 파일 선택 시
        if (imageUpload) {
            imageUpload.addEventListener('change', handleImageSelect);
        }

        // 드래그 앤 드롭
        if (previewContainer) {
            previewContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                previewContainer.classList.add('drag_over');
            });

            previewContainer.addEventListener('dragleave', () => {
                previewContainer.classList.remove('drag_over');
            });

            previewContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                previewContainer.classList.remove('drag_over');

                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    handleImageFile(files[0]);
                }
            });
        }
    }

    function handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    }

    function handleImageFile(file) {
        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imagePreview = document.getElementById('imagePreview');
            const imageUploadPlaceholder = document.getElementById('imageUploadPlaceholder');
            const imageActions = document.getElementById('imageActions');

            if (imagePreview) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'none';
            if (imageActions) imageActions.style.display = 'flex';

            updateSaveButtonState();
        };
        reader.readAsDataURL(file);
    }

    function resetImageUpload() {
        const imagePreview = document.getElementById('imagePreview');
        const imageUploadPlaceholder = document.getElementById('imageUploadPlaceholder');
        const imageActions = document.getElementById('imageActions');
        const imageUpload = document.getElementById('imageUpload');

        if (imagePreview) imagePreview.style.display = 'none';
        if (imageUploadPlaceholder) imageUploadPlaceholder.style.display = 'flex';
        if (imageActions) imageActions.style.display = 'none';
        if (imageUpload) imageUpload.value = '';

        updateSaveButtonState();
    }

    function setupTextInputEvents() {
        const postContent = document.getElementById('postContent');

        if (postContent) {
            postContent.addEventListener('input', () => {
                updateSaveButtonState();
            });
        }
    }

    function updateSaveButtonState() {
        const saveBtn = document.getElementById('saveCreatePost');
        const postContent = document.getElementById('postContent');
        const imagePreview = document.getElementById('imagePreview');

        if (saveBtn && postContent) {
            const hasContent = postContent.value.trim().length > 0;
            const hasImage = imagePreview && imagePreview.style.display === 'block';

            saveBtn.disabled = !(hasContent || hasImage);
        }
    }

    function handleCreatePost() {
        const postContent = document.getElementById('postContent');
        const imagePreview = document.getElementById('imagePreview');

        if (!postContent) return;

        const content = postContent.value.trim();

        // 새 게시물 데이터 생성
        const newPost = {
            id: posts.length + 1,
            username: "MyDog_" + Math.floor(Math.random() * 1000),
            userProfile: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face",
            timeAgo: "방금 전",
            image: imagePreview && imagePreview.style.display === 'block' ?
                imagePreview.src :
                `https://images.unsplash.com/photo-${1550000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop&auto=format&q=80`,
            likes: [],
            content: "새로운 게시글입니다",
            description: content || "새로운 게시글을 작성했습니다! 🐾",
            comments: 0,
            liked: false,
            bookmarked: false
        };

        // 게시물 배열에 추가
        posts.unshift(newPost);

        // 게시물 다시 렌더링
        createPosts();

        // 모달 닫기
        hideCreatePostModal();

        // 성공 메시지
        showSuccessMessage('게시글이 성공적으로 작성되었습니다! 🎉');

        console.log('✅ 새 게시글 생성:', newPost);
    }

    function showSuccessMessage(message) {
        // 간단한 토스트 메시지
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #4caf50, #66bb6a);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // 애니메이션
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // 3초 후 제거
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
        console.log('🎯 이벤트 리스너 설정 시작');

        // 구글 로그인 버튼
        const signInBtn = document.getElementById('googleSignInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', signInGoogle);
            console.log('✅ 구글 로그인 버튼 이벤트 설정');
        }

        // 캘린더 네비게이션
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');

        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                console.log('◀ 이전 월 클릭');
                calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() - 1);
                renderCalendarNow();
            });
            console.log('✅ 이전 월 버튼 이벤트 설정');
        }

        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                console.log('▶ 다음 월 클릭');
                calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() + 1);
                renderCalendarNow();
            });
            console.log('✅ 다음 월 버튼 이벤트 설정');
        }

        // 일정 추가 버튼
        const addEventBtn = document.getElementById('addEventBtn');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                console.log('➕ 일정 추가 버튼 클릭');
                if (calendarState.isSignedIn && calendarState.apiLoaded) {
                    showEventModal();
                } else {
                    showEventModal(); // API 없어도 모달 표시
                }
            });
            console.log('✅ 일정 추가 버튼 이벤트 설정');
        }

        console.log('✅ 모든 이벤트 리스너 설정 완료');
    }

    // 기본 일정 목록 렌더링
    function renderBasicEventsList() {
        const eventsList = document.getElementById('eventsList');
        const noEvents = document.getElementById('noEvents');

        if (!eventsList) return;

        // API가 없을 때 샘플 일정 표시
        const sampleEvents = [
            { title: '강아지 산책 모임', date: '1월 15일' },
            { title: '반려견 훈련 클래스', date: '1월 20일' },
            { title: '펫샵 할인 행사', date: '1월 25일' }
        ];

        eventsList.innerHTML = '';

        sampleEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'board_schedule_list';
            eventElement.innerHTML = `
                <div class="schedule_doc"></div>
                <div class="schedule_info">
                    <span class="schedule_date">${event.date}</span>
                    <span class="schedule_title">${event.title}</span>
                </div>
            `;
            eventsList.appendChild(eventElement);
        });

        console.log('✅ 기본 일정 목록 렌더링 완료');
    }

    // 이벤트 모달 표시
    function showEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            document.body.style.overflow = 'hidden';

            // 모달 닫기 이벤트 설정
            setupEventModalEvents();
        }
    }


// 수정모드 취소 및 초기화 함수 (필수)
    function resetEditMode(modal) {
        editingCommentCno = null;
        const input = modal.querySelector('.comment_input');
        if (input) {
            input.value = '';
            input.placeholder = '댓글 달기...';
        }
    }

    function hideEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    function setupEventModalEvents() {
        const modal = document.getElementById('eventModal');
        const closeBtn = document.getElementById('closeEventModal');
        const cancelBtn = document.getElementById('cancelEvent');
        const saveBtn = document.getElementById('saveEvent');
        const overlay = modal ? modal.querySelector('.modal_overlay') : null;

        const closeModal = () => hideEventModal();

        // 이벤트 리스너 중복 방지를 위해 제거 후 추가
        if (closeBtn) {
            closeBtn.removeEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.removeEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModal();
                }
            });
        }

        // ESC 키로 모달 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 저장 버튼 이벤트
        if (saveBtn) {
            saveBtn.removeEventListener('click', handleSaveEvent);
            saveBtn.addEventListener('click', handleSaveEvent);
        }
    }

    function handleSaveEvent() {
        const title = document.getElementById('eventTitle');
        const date = document.getElementById('eventDate');
        const time = document.getElementById('eventTime');
        const description = document.getElementById('eventDescription');
        const location = document.getElementById('eventLocation');

        if (!title || !date) {
            alert('제목과 날짜는 필수입니다.');
            return;
        }

        if (!title.value || !date.value) {
            alert('제목과 날짜는 필수입니다.');
            return;
        }

        // 이벤트 데이터 생성
        const newEvent = {
            title: title.value,
            date: date.value,
            time: time ? time.value : '',
            description: description ? description.value : '',
            location: location ? location.value : '',
            created: new Date().toISOString()
        };

        console.log('새 이벤트 생성:', newEvent);

        // 로컬에 저장
        addLocalEvent(newEvent);
        showSuccessMessage('일정이 추가되었습니다! 📅');
        hideEventModal();
        resetEventForm();
    }

    function addLocalEvent(event) {
        // 로컬 이벤트 목록에 추가
        if (!window.localEvents) {
            window.localEvents = [];
        }
        window.localEvents.push(event);

        // 일정 목록 업데이트
        updateLocalEventsList();
    }

    function updateLocalEventsList() {
        const eventsList = document.getElementById('eventsList');
        if (!eventsList || !window.localEvents) return;

        eventsList.innerHTML = '';

        window.localEvents.slice(0, 3).forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'board_schedule_list';
            eventElement.innerHTML = `
                <div class="schedule_doc"></div>
                <div class="schedule_info">
                    <span class="schedule_date">${formatLocalEventDate(event.date)}</span>
                    <span class="schedule_title">${event.title}</span>
                </div>
            `;
            eventsList.appendChild(eventElement);
        });
    }

    function formatLocalEventDate(dateString) {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}월 ${day}일`;
    }

    function resetEventForm() {
        const inputs = ['eventTitle', 'eventDate', 'eventTime', 'eventDescription', 'eventLocation'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    // 구글 API 관련 함수들 (기본 구현)
    async function initializeGoogleAPI() {
        console.log('🔄 구글 API 초기화 시작...');
        console.warn('⚠️  구글 API 키가 설정되지 않았습니다. 기본 캘린더를 표시합니다.');
    }

    async function signInGoogle() {
        console.log('구글 로그인 시도');
    }

    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        @keyframes heartPop {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 1;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
        }
        
        .post_heart_icon.liked svg path {
            fill: #ff6b6b;
            stroke: #ff6b6b;
        }
        
        .post_bookmark_icon.bookmarked svg path {
            fill: #ffd700;
            stroke: #ffd700;
        }
        
        .modal_heart_icon.liked svg path {
            fill: #ff6b6b;
            stroke: #ff6b6b;
        }
        
        .modal_bookmark_icon.bookmarked svg path {
            fill: #ffd700;
            stroke: #ffd700;
        }
        
        .post_heart_icon svg,
        .post_comment_icon svg,
        .post_share_icon svg,
        .post_bookmark_icon svg,
        .modal_heart_icon svg,
        .modal_comment_icon svg,
        .modal_share_icon svg,
        .modal_bookmark_icon svg {
            pointer-events: none;
        }
        
        .drag_over {
            border-color: #ff6b6b !important;
            background-color: #fff8f8 !important;
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);

    // 페이지 로드 완료 애니메이션
    const elements = document.querySelectorAll('.group_board, .group_board_calendar, .group_board_schedule, .group_chat_list_box');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });

    console.log('반려견 소셜 미팅 플랫폼 로드 완료! 🐾');
});

function updateUIAccessBasedOnStatus() {
    const addPostButton = document.querySelector('.add_post_btn'); // 게시물 추가 버튼
    // 게시물 모달 내 댓글 입력 관련 요소들은 모달이 열릴 때 처리하거나, 전역적으로 클래스를 부여해서 제어
    const commentInputAreas = document.querySelectorAll('.modal_comment_input'); // 예시 선택자

    if (currentUserGroupStatus === "LEADER" || currentUserGroupStatus === "MEMBER") {
        // 멤버 또는 리더일 경우: 글쓰기, 댓글쓰기 가능
        if (addPostButton) {
            addPostButton.style.display = 'block'; // 또는 'flex', 'inline-block' 등 원래대로
            // addPostButton.disabled = false; // 버튼일 경우
        }
        commentInputAreas.forEach(area => {
            // const input = area.querySelector('input[type="text"]');
            // const submitBtn = area.querySelector('button.comment_submit');
            // if(input) input.disabled = false;
            // if(submitBtn) submitBtn.style.display = 'block'; // 또는 원래대로
            area.style.display = 'block'; // 댓글 입력 영역 전체를 보여줌
        });
    } else { // NOT_JOINED 또는 null (오류 발생 시)
        // 비가입자일 경우: 글쓰기, 댓글쓰기 제한
        if (addPostButton) {
            addPostButton.style.display = 'none'; // 아예 숨기기
            // addPostButton.disabled = true;
        }
        commentInputAreas.forEach(area => {
            // const input = area.querySelector('input[type="text"]');
            // const submitBtn = area.querySelector('button.comment_submit');
            // if(input) {
            //     input.disabled = true;
            //     input.placeholder = "그룹 멤버만 댓글 작성이 가능합니다.";
            // }
            // if(submitBtn) submitBtn.style.display = 'none';
            area.style.display = 'none'; // 댓글 입력 영역 전체를 숨김
        });
        // 추가적으로, 이미 렌더링된 댓글들의 수정/삭제 버튼도 숨기거나 비활성화 할 수 있습니다.
        // document.querySelectorAll('.edit-comment-btn, .delete-comment-btn').forEach(btn => btn.style.display = 'none');
    }
}

function openApplyModalOnBoard(gno, groupName) {
    const applyModal = document.getElementById('applyToGroupModal');
    const groupNameSpan = document.getElementById('applyModalTargetGroupName_board');
    const submitBtn = document.getElementById('submitApplyBtn_board');
    const profileGrid = document.getElementById('applyModalProfileGrid_board');

    if (!applyModal || !groupNameSpan || !submitBtn || !profileGrid) {
        console.error("가입 신청 모달(on board)의 일부 HTML 요소를 찾을 수 없습니다.");
        return;
    }

    groupNameSpan.textContent = groupName || `그룹 (ID: ${gno})`;
    submitBtn.disabled = true;
    profileGrid.innerHTML = '<p>강아지 목록을 불러오는 중...</p>';

    applyModal.style.display = 'flex';
    loadMyDogsForApplyModalOnBoard(profileGrid, submitBtn);
}

function closeApplyModal() { // 이 함수는 그룹 만들기 모달의 close와 다르게 동작할 수 있으므로 이름 유지 또는 변경
    const applyModal = document.getElementById('applyToGroupModal');
    if (applyModal) {
        applyModal.style.display = 'none';
    }
    selectedDogDnoForBoardApply = null;
    const submitBtn = document.getElementById('submitApplyBtn_board');
    if (submitBtn) {
        submitBtn.textContent = '가입 신청하기';
        submitBtn.disabled = true;
    }
    // 모달 내 선택된 카드 스타일 초기화
    const profileGrid = document.getElementById('applyModalProfileGrid_board');
    if(profileGrid) {
        profileGrid.querySelectorAll('.profile_card.selected').forEach(card => card.classList.remove('selected'));
    }
}

async function loadMyDogsForApplyModalOnBoard(dogsGridElement, submitButtonElement) {
    // (이전 답변의 loadMyDogsForApplyModal 함수 내용과 거의 동일하게 구현)
    // API 호출: /groups/api/my-dogs
    // 성공 시: dogsGridElement에 profile_card 들을 생성하여 추가 (각 카드 클릭 시 handleDogSelectionForApplyModalOnBoard 호출)
    // 실패 또는 강아지 없을 시: 적절한 메시지 표시 및 submitButtonElement 비활성화
    try {
        const response = await fetch('/groups/api/my-dogs');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`내 강아지 목록 로드 실패 (ApplyModal): ${response.status} ${errorText}`);
        }
        const dogs = await response.json();

        dogsGridElement.innerHTML = '';
        if (!dogs || dogs.length === 0) {
            dogsGridElement.innerHTML = '<p>가입 신청에 사용할 등록된 강아지가 없습니다.</p>';
            if(submitButtonElement) submitButtonElement.disabled = true;
            return;
        }

        dogs.forEach(dog => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'profile_card'; // 그룹 만들기 3단계와 동일한 CSS 클래스 사용 가능
            cardDiv.dataset.dogDno = dog.dno;
            cardDiv.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url('${dog.avatarUrl || '/images/default_dog_profile.png'}')`;
            cardDiv.style.cursor = 'pointer';
            cardDiv.innerHTML = `
                <div class="profile_info_overlay">
                    <div class="profile_name">${dog.dname}</div>
                    <div class="profile_details">
                        <span class="profile_detail_item">${dog.speciesName || ''}</span>
                        <span class="profile_detail_item">${dog.size || ''}</span>
                        <span class="profile_detail_item">${dog.gender || ''}</span>
                    </div>
                </div>
            `;
            cardDiv.addEventListener('click', function() {
                handleDogSelectionForApplyModalOnBoard(dog.dno, this, dogsGridElement, submitButtonElement);
            });
            dogsGridElement.appendChild(cardDiv);
        });
    } catch (error) {
        console.error("가입 신청 모달용 내 강아지 목록 로드 오류:", error);
        dogsGridElement.innerHTML = '<p>강아지 정보를 불러오는 중 오류가 발생했습니다.</p>';
        if(submitButtonElement) submitButtonElement.disabled = true;
    }
}

function handleDogSelectionForApplyModalOnBoard(dogDno, clickedCardElement, dogsGridElement, submitButtonElement) {
    // (이전 답변의 handleDogSelectionForApplyModal 함수 내용과 거의 동일하게 구현)
    // 모든 카드에서 'selected' 클래스 제거 -> 클릭된 카드에 'selected' 클래스 추가
    // selectedDogDnoForBoardApply = dogDno;
    // submitButtonElement.disabled = false;
    if(dogsGridElement) {
        dogsGridElement.querySelectorAll('.profile_card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    }
    clickedCardElement.classList.add('selected');
    selectedDogDnoForBoardApply = dogDno;
    if(submitButtonElement) submitButtonElement.disabled = false;
    console.log("가입 신청할 강아지 선택됨 (Board Apply Modal):", selectedDogDnoForBoardApply);
}

async function submitGroupApplicationOnBoard(event) { // 함수 이름 변경
    const submitBtn = event.target;
    // const gnoToApply = currentGno; // 전역 변수 currentGno 사용

    if (!selectedDogDnoForBoardApply) {
        alert("가입할 강아지를 선택해주세요.");
        return;
    }
    if (!currentGno) { // currentGno가 설정되었는지 확인
        alert("가입할 그룹 정보(GNO)가 없습니다.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '신청 중...';

    const formData = new FormData();
    formData.append('dogId', selectedDogDnoForBoardApply);

    try {
        const response = await fetch(`/groups/${currentGno}/apply`, { // currentGno 사용
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = '그룹 가입 신청에 실패했습니다.';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch(e) {
                if(errorText && errorText.length < 100) errorMessage = errorText;
            }
            throw new Error(errorMessage);
        }

        alert('그룹 가입 신청이 완료되었습니다. 리더의 승인을 기다려주세요.');
        closeApplyModal();

        // 중요: 가입 신청 후 메뉴 상태를 다시 로드하여 "가입하기" 버튼 등을 업데이트
        // menu-status API를 다시 호출하고 UI를 갱신하는 함수가 있다면 호출
        // 예: fetchMenuStatusAndUpdateAllRelatedUI();
        // 가장 간단하게는 페이지를 새로고침하거나, menu-status만 다시 fetch하여 버튼 상태를 바꿀 수 있습니다.
        // 여기서는 menu-status를 다시 fetch하여 버튼 상태와 currentUserGroupStatus를 업데이트하고,
        // updateUIAccessBasedOnStatus()를 호출하는 것을 가정합니다.
        fetch(`/groups/${currentGno}/menu-status`)
            .then(res => {
                if(!res.ok) return null;
                return res.json();
            })
            .then(data => {
                if(data) {
                    currentUserGroupStatus = data.status;
                    // 메뉴 버튼들 다시 설정 (DOMContentLoaded 내부 로직과 유사하게)
                    const joinGroupBtn = document.getElementById("join-group");
                    if(joinGroupBtn) joinGroupBtn.style.display = (currentUserGroupStatus === "NOT_JOINED" ? "block" : "none");
                    // 가입 대기중이라는 텍스트/상태로 변경하는 로직이 있다면 추가
                }
                updateUIAccessBasedOnStatus();
            });


    } catch (error) {
        console.error('그룹 가입 신청 중 오류:', error);
        alert(error.message || '그룹 가입 신청 중 오류가 발생했습니다.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '가입 신청하기';
    }
}