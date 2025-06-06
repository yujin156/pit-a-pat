

// DOM 요소들
const navButtons = document.querySelectorAll('.myPage_nav-btn');
const tabContents = document.querySelectorAll('.myPage_tab_content');
const tabToggleButtons = document.querySelectorAll('.myPage_tab_toggle');
const toggleContents = document.querySelectorAll('.myPage_toggle_content');

// 강아지 프로필 데이터 (모달과 공유)
let dogProfiles = []; // 저장된 프로필들

// 데이터 템플릿들
let postsData = [

];

let commentsData = [

];

const bookmarksData = [
    {
        type: 'social',
        id: 1,
        user: {
            name: 'Dog_writer',
            profileImage: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=40&h=40&fit=crop&crop=face',
            timeAgo: '1일 전'
        },
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop',
        likes: 15,
        content: '우리 강아지가 너무 귀여워요! 🐕',
        comments: 4
    },
];

// SVG 아이콘들
const SVG_ICONS = {
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="23.002" height="20.713" viewBox="0 0 23.002 20.713">
      <path id="heart" d="M6.773,2.007A5.325,5.325,0,0,0,2.694,3.524a5.862,5.862,0,0,0,.384,8.254l.751.751,6.828,6.833a.732.732,0,0,0,1.034,0l6.825-6.833.751-.751a5.859,5.859,0,0,0,.381-8.253,5.839,5.839,0,0,0-8.238.387l-.237.237-.237-.237A6.386,6.386,0,0,0,6.773,2.007Z" transform="translate(0.33 -0.497)" fill="none" stroke="#b7b7b7" stroke-width="3"/>
    </svg>`,
    comment: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="19.973" viewBox="0 0 20 19.973">
      <path id="chat" d="M7.992,10.987a1,1,0,1,0,1,1A1,1,0,0,0,7.992,10.987Zm3.994,0a1,1,0,1,0,1,1A1,1,0,0,0,11.986,10.987Zm3.994,0a1,1,0,1,0,1,1A1,1,0,0,0,15.98,10.987ZM11.986,2A9.986,9.986,0,0,0,2,11.986a9.876,9.876,0,0,0,2.257,6.321l-2,2A.974.974,0,0,0,3,21.972h8.987A9.986,9.986,0,1,0,11.986,2Zm0,17.974H5.405l.929-.929a.977.977,0,0,0,0-1.408,7.989,7.989,0,1,1,5.652,2.337Z" transform="translate(-1.972 -2)" fill="#b7b7b7"/>
    </svg>`,
    bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="21.333" viewBox="0 0 16 21.333">
      <path id="bookmark" d="M14.667,0H1.333A1.333,1.333,0,0,0,0,1.333V20a1.333,1.333,0,0,0,2.166,1.041L8,16.374l5.834,4.667A1.333,1.333,0,0,0,16,20V1.333A1.333,1.333,0,0,0,14.667,0Z" fill="#387feb"/>
    </svg>`
    };

// 템플릿 생성 함수들
function createPostCard(post) {
    // participants 필드가 없거나 undefined/null이면 빈 배열로 대체
    const participantsHTML = (post.participants || []).map(avatar =>
        `<img src="${avatar}" alt="참가자" class="myPage_participant_avatar">`
    ).join('');

    return `
        <article class="myPage_post_card" data-post-id="${post.id}">
            <img src="${post.image}" alt="${post.title}" class="myPage_post_image">
            <div class="myPage_post_content">
                <h3>${post.title}</h3>
                <p class="myPage_post_description">${post.description}</p>
                <div class="myPage_post_participants">
                    ${participantsHTML}
                </div>
            </div>
            <button class="myPage_post_menu">⋯</button>
        </article>
    `;
}

function createCommentCard(comment) {
    return `
        <article class="myPage_comment_card" data-comment-id="${comment.id}">
            <div class="myPage_comment_header">
                <span class="myPage_username">${comment.username}</span>
                <span class="myPage_comment_label">댓글</span>
            </div>
            <div class="myPage_comment_content">
                <p class="myPage_comment_text">${comment.text}</p>
                <p class="myPage_comment_description">${comment.description}</p>
                <p class="myPage_comment_date">${comment.date}</p>
                <div class="myPage_linked_post">
                    <img src="${comment.linkedPost.image}" alt="관련 게시글" class="myPage_linked_post_image">
                    <span class="myPage_linked_post_title">${comment.linkedPost.title}</span>
                </div>
            </div>
            <button class="myPage_comment_menu">⋯</button>
        </article>
    `;
}

function createSocialPost(item) {
    return `
        <article class="myPage_social_post" data-social-id="${item.id}">
            <div class="myPage_post_writer">
                <div class="myPage_writer">
                    <div class="myPage_post_user_info">
                        <div class="myPage_post_profile_img">
                            <img src="${item.user.profileImage}" alt="${item.user.name}">
                        </div>
                        <div class="post_user_details">
                            <div class="board_write_user">${item.user.name}</div>
                            <span class="board_write_time">${item.user.timeAgo}</span>
                        </div>
                    </div>
                    <div class="post_menu_btn">⋯</div>
                </div>
                <div class="board_post_img">
                    <img src="${item.image}" alt="게시물 이미지">
                </div>
                <div class="board_svg_row">
                    <div class="post_right_nav">
                        <div class="post_heart_icon">
                            ${SVG_ICONS.heart}
                        </div>
                        <div class="post_comment_icon">
                            ${SVG_ICONS.comment}
                        </div>
                    </div>
                    <div class="post_bookmark_icon active">
                        ${SVG_ICONS.bookmark}
                    </div>
                </div>
                <div class="post_content_section">
                    <span class="post_who_like">좋아요 ${item.likes}개</span>
                    <div class="post_content">
                        <span class="post_username">${item.user.name}</span>
                        <span class="post_text">${item.content}</span>
                    </div>
                    <span class="post_comment_count">댓글 ${item.comments}개 모두 보기</span>
                </div>
            </div>
        </article>
    `;
}

function createBookmarkPost(item) {
    const participantsHTML = item.participants.map(avatar =>
        `<img src="${avatar}" alt="참가자" class="myPage_participant_avatar">`
    ).join('');

    return `
        <article class="myPage_post_card" data-post-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" class="myPage_post_image">
            <div class="myPage_post_content">
                <h3>${item.title}</h3>
                <p class="myPage_post_description">${item.description}</p>
                <div class="myPage_post_participants">
                    ${participantsHTML}
                </div>
            </div>
            <button class="myPage_post_menu">⋯</button>
        </article>
    `;
}

function createDogProfileCard(profile) {
    const profileId = profile.id;  // ← 이제 id 필드 사용!
    const imageUrl = profile.imageUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face';
    const genderText = profile.gender === 'MALE' ? '수컷' : '암컷';

    return `
        <div class="myPage_dog_card" data-profile-id="${profileId}">
            <img src="${imageUrl}" alt="${profile.name}" class="dog-image">
            <div class="myPage_dog_info">
                <h4>${profile.name}</h4>
                <p>
                    <span>${getSizeLabel(profile.size)}</span>
                    <span>${profile.breed}</span>
                    <span>${genderText}</span>
                </p>
            </div>
            <button class="myPage_dog_more_btn">⋯</button>
        </div>
    `;
}

// 헬퍼 함수들
function getSizeLabel(size) {
    const sizeLabels = {
        'small': '소형견',
        'medium': '중형견',
        'large': '대형견'
    };
    return sizeLabels[size] || size;
}
function fetchAndRenderPosts() {
    fetch('/api/mypage/posts')
        .then(res => res.json())
        .then(data => {
            postsData = data;
            renderPosts();
        })
        .catch(err => {
            console.error("게시글 불러오기 실패:", err);
            document.getElementById('posts-container').innerHTML = '<span>게시글 불러오기 오류</span>';
        });
}
// 콘텐츠 렌더링 함수들
function renderPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    if (postsData.length === 0) {
        container.innerHTML = '<span>게시글이 없습니다.</span>';
    } else {
        container.innerHTML = postsData.map(post => createPostCard(post)).join('');
    }
    attachPostEventListeners();
}

function fetchAndRenderComments() {
    fetch('/api/mypage/comments')
        .then(res => res.json())
        .then(data => {
            commentsData = data;
            renderComments();
        })
        .catch(err => {
            console.error("댓글 불러오기 실패:", err);
            document.getElementById('comments-container').innerHTML = '<span>댓글 불러오기 오류</span>';
        });
}

function renderComments() {
    const container = document.getElementById('comments-container');
    if (!container) return;
    if (commentsData.length === 0) {
        container.innerHTML = '<span>댓글이 없습니다.</span>';
    } else {
        container.innerHTML = commentsData.map(comment => createCommentCard(comment)).join('');
    }
    attachCommentEventListeners();
}

function renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    if (container) {
        const bookmarksHTML = bookmarksData.map(item => {
            if (item.type === 'social') {
                return createSocialPost(item);
            } else if (item.type === 'post') {
                return createBookmarkPost(item);
            }
            return '';
        }).join('');
        container.innerHTML = bookmarksHTML;
        attachBookmarkEventListeners();
    }
}

function renderDogProfiles() {
    const profilesContainer = document.querySelector('.myPage_dog_profiles');
    if (!profilesContainer) return;

    // 기존 프로필 카드들 제거 (추가 버튼은 유지)
    const existingCards = profilesContainer.querySelectorAll('.myPage_dog_card');
    existingCards.forEach(card => card.remove());

    // 새 프로필 카드들 추가
    const addButton = profilesContainer.querySelector('.myPage_add_profile');
    if (addButton) {
        dogProfiles.forEach(profile => {
            const profileHTML = createDogProfileCard(profile);
            addButton.insertAdjacentHTML('beforebegin', profileHTML);
        });
    }
}

// 이벤트 리스너 부착 함수들
function attachPostEventListeners() {
    document.querySelectorAll('.myPage_post_card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.myPage_post_menu')) return;
            const postId = card.dataset.postId;
            const title = card.querySelector('h3').textContent;
            alert(`"${title}" 게시글 상세보기로 이동합니다. (ID: ${postId})`);
        });
    });

    document.querySelectorAll('.myPage_post_menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, 'post');
        });
    });

    attachAvatarHoverEffects();
}

function attachCommentEventListeners() {
    document.querySelectorAll('.myPage_comment_card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.myPage_comment_menu')) return;
            const commentId = card.dataset.commentId;
            const linkedPost = card.querySelector('.myPage_linked_post_title').textContent;
            alert(`"${linkedPost}" 게시글로 이동합니다. (댓글 ID: ${commentId})`);
        });
    });

    document.querySelectorAll('.myPage_comment_menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, 'comment');
        });
    });

    document.querySelectorAll('.myPage_linked_post').forEach(post => {
        post.addEventListener('click', (e) => {
            e.stopPropagation();
            const title = post.querySelector('.myPage_linked_post_title').textContent;
            alert(`"${title}" 원본 게시글로 이동합니다.`);
        });
    });
}

function attachBookmarkEventListeners() {
    document.querySelectorAll('.post_heart_icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const heartPath = btn.querySelector('path');
            if (heartPath) {
                const currentFill = heartPath.getAttribute('fill');
                if (currentFill === 'none' || !currentFill) {
                    heartPath.setAttribute('fill', '#ff6b6b');
                    heartPath.setAttribute('stroke', '#ff6b6b');
                } else {
                    heartPath.setAttribute('fill', 'none');
                    heartPath.setAttribute('stroke', '#666');
                }
            }
        });
    });

    document.querySelectorAll('.post_bookmark_icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('active');
        });
    });

    document.querySelectorAll('.post_comment_count').forEach(count => {
        count.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('댓글 상세보기로 이동합니다.');
        });
    });

    document.querySelectorAll('.post_who_like').forEach(count => {
        count.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('좋아요한 사용자 목록을 보여줍니다.');
        });
    });

    document.querySelectorAll('.board_post_img img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('이미지를 확대해서 보여줍니다.');
        });
    });

    document.querySelectorAll('.myPage_post_profile_img img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const username = img.closest('.myPage_post_user_info').querySelector('.board_write_user').textContent;
            alert(`${username}의 프로필로 이동합니다.`);
        });
    });

    document.querySelectorAll('.post_menu_btn, .myPage_post_menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, 'social');
        });
    });

    attachAvatarHoverEffects();
}

function attachAvatarHoverEffects() {
    document.querySelectorAll('.myPage_participant_avatar').forEach(avatar => {
        avatar.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.transition = 'transform 0.2s ease';
        });

        avatar.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'scale(1)';
        });
    });
}

// 탭 전환 함수
function switchTab(targetTab) {
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    const clickedButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    const targetContent = document.getElementById(targetTab === 'profile' ? 'myPage_profile' : targetTab);
    if (targetContent) {
        targetContent.classList.add('active');
        console.log(`탭 "${targetTab}" 활성화됨`);
    }

    if (targetTab === 'posts') {
        switchToggle('posts-content');
    } else if (targetTab === 'bookmarks') {
        renderBookmarks();
    }
}

// 토글 전환 함수 (게시글/댓글)
function switchToggle(targetToggle) {
    tabToggleButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    toggleContents.forEach(content => {
        content.classList.remove('active');
    });

    const clickedToggle = document.querySelector(`[data-toggle="${targetToggle}"]`);
    if (clickedToggle) {
        clickedToggle.classList.add('active');
    }

    const targetContent = document.getElementById(targetToggle);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    if (targetToggle === 'posts-content') {
        renderPosts();
    } else if (targetToggle === 'comments-content') {
        renderComments();
    }
}

// 컨텍스트 메뉴 관련 함수들
function showContextMenu(event, type = 'general', id = null) {
    event.preventDefault();
    event.stopPropagation();

    // 간단한 컨텍스트 메뉴 생성
    const existingMenu = document.getElementById('contextMenu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu';
    contextMenu.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        min-width: 120px;
        padding: 8px 0;
    `;

    contextMenu.innerHTML = `
        <div style="padding: 8px 16px; cursor: pointer; hover:background-color: #f5f5f5;" onclick="editItem('${type}', '${id}')">수정</div>
        <div style="padding: 8px 16px; cursor: pointer; hover:background-color: #f5f5f5;" onclick="deleteItem('${type}', '${id}')">삭제</div>
        <div style="padding: 8px 16px; cursor: pointer; hover:background-color: #f5f5f5;" onclick="shareItem('${type}', '${id}')">공유</div>
    `;

    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    document.body.appendChild(contextMenu);

    // 클릭 외부 영역에서 메뉴 닫기
    const closeMenu = (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

// 실제 데이터 불러오기 (AJAX)
function mypageFetchAndRenderDogProfiles() {
    fetch('/api/mypage/dogs')
        .then(res => res.json())
        .then(data => {
            dogProfiles = data;
            renderDogProfiles();
        })
        .catch(err => {
            console.error('강아지 목록 불러오기 실패:', err);
        });
}

function deleteItem(type, id) {
    if (type === 'profile' && id) {
        if (!confirm('정말로 이 강아지 프로필을 삭제하시겠습니까?')) return;
        // 실제 삭제 요청
        fetch(`/api/mypage/${id}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('삭제 실패');
                return res.text();
            })
            .then(msg => {
                alert(msg);
                if (typeof window.fetchAndRenderDogProfiles === 'function'  && typeof window.mypageFetchAndRenderDogProfiles == 'function') {
                    window.mypageFetchAndRenderDogProfiles();
                    window.fetchAndRenderDogProfiles();
                }
            })
            .catch(err => {
                alert('❌ 삭제 실패: ' + err.message);
            });
    } else {
        if (confirm('이 항목을 삭제하시겠습니까?')) {
            alert('삭제 기능을 실행합니다.');
        }
    }

    document.getElementById('contextMenu')?.remove();
}

function showDogProfileMenu(event, profileId) {
    console.log('[DEBUG] showDogProfileMenu 호출됨:', profileId);
    showContextMenu(event, 'profile', profileId);
}

function editItem(type, id) {
    if (type === 'profile' && id) {
        const profile = dogProfiles.find(p => p.id == id);
        if (profile) {
            alert(`${profile.name} 프로필을 편집합니다.`);
            // 여기에 편집 로직 추가
        }
    } else {
        alert('편집 기능을 실행합니다.');
    }

    document.getElementById('contextMenu')?.remove();
}


function shareItem(type, id) {
    alert('공유 기능을 실행합니다.');
    document.getElementById('contextMenu')?.remove();
}

// 모달에서 프로필이 추가될 때 호출되는 함수
function addDogProfile(profileData) {
    dogProfiles.push({...profileData});
    renderDogProfiles();
    console.log('새 프로필 추가됨:', profileData);
}

// 네비게이션 버튼들에 이벤트 리스너 추가
navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = e.target.getAttribute('data-tab');
        console.log(`네비게이션 클릭: ${targetTab}`);
        switchTab(targetTab);
    });
});

// 토글 버튼들에 이벤트 리스너 추가
tabToggleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetToggle = e.target.getAttribute('data-toggle');
        console.log(`토글 클릭: ${targetToggle}`);
        switchToggle(targetToggle);
    });
});

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료');
    mypageFetchAndRenderDogProfiles();
    // 기본 탭 활성화
    switchTab('profile');

    // 프로필 추가 버튼 이벤트 (openProfileModal은 modal.js에서 제공)
    const addProfileBtn = document.getElementById('addProfileBtn');
    if (addProfileBtn) {
        addProfileBtn.addEventListener('click', () => {
            if (typeof openProfileModal === 'function') {
                openProfileModal();
            } else {
                console.error('openProfileModal 함수를 찾을 수 없습니다. modal.js가 로드되었는지 확인하세요.');
            }
        });
    }

    // 사용자 정보 변경 버튼들
    document.querySelectorAll('.myPage_edit_btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const field = e.target.closest('.myPage_info_item').querySelector('.myPage_field').textContent;
            alert(`${field} 변경 기능을 실행합니다.`);
        });
    });

    document.querySelectorAll('.myPage_unlink_btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('연결된 서비스를 해제하시겠습니까?')) {
                alert('서비스 연결이 해제되었습니다.');
            }
        });
    });

    console.log('이벤트 리스너 초기화 완료');
    fetchAndRenderPosts();
    fetchAndRenderComments();
});
document.body.addEventListener('click', function(e) {
    // 1) 로그 찍어서 진짜 버튼까지 오는지 확인
    if (e.target.classList.contains('myPage_dog_more_btn')) {
        const card = e.target.closest('.myPage_dog_card');
        const profileId = card ? card.dataset.profileId : null;
        console.log('[DEBUG] 더보기 버튼 클릭됨! profileId:', profileId); // 로그 추가!
        if (profileId) {
            showDogProfileMenu(e, profileId);
        }
    }
});
// 전역 함수로 노출 (HTML 및 모달에서 호출 가능)
window.editItem = editItem;
window.deleteItem = deleteItem;
window.shareItem = shareItem;
window.showDogProfileMenu = showDogProfileMenu;
window.addDogProfile = addDogProfile;
window.renderDogProfiles = renderDogProfiles;
window.fetchAndRenderPosts = fetchAndRenderPosts;
window.mypageFetchAndRenderDogProfiles = mypageFetchAndRenderDogProfiles;
console.log('MyPage JavaScript 파일 로드 완료');