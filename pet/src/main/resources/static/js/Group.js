// static/js/group.js
// 서버에서 전달된 JSON 데이터 (Thymeleaf inline)
const allGroups = /*[[${allGroupsJson}]]*/ [];
const applicationGroups = /*[[${applicationGroupsJson}]]*/ [];

let currentTab = 'my';
let selectedInterest = null;

// DOM 준비 후 초기 설정
document.addEventListener('DOMContentLoaded', () => {
    // 기본 탭 설정 및 이벤트 바인딩
    switchTab('my');
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', searchGroups);
    const keywordSelect = document.querySelector('.keyword_select');
    if (keywordSelect) keywordSelect.addEventListener('change', e => filterByKeyword(e.target.value));
});

// 탭 전환
function switchTab(tabType, evt) {
    if (evt) {
        document.querySelectorAll('.tab_item').forEach(t => t.classList.remove('active'));
        evt.target.classList.add('active');
    }
    currentTab = tabType;
    renderTabContent();
}

// 탭별 콘텐츠 렌더링
function renderTabContent() {
    const grid = document.getElementById('groupsGrid');
    let html = '';

    if (currentTab === 'my') {
        // 만들기 카드
        html += `<div class="group_card create_card" onclick="openModal()"><span>+</span><p>만들기</p></div>`;
         const joined = applicationGroups.filter(g => g.status === 'accepted');

        joined.forEach(g => html += createGroupCard(g));
    }
    else if (currentTab === 'all') {
        allGroups.forEach(g => html += createGroupCard(g));
        filterByKeyword(document.querySelector('.keyword_select')?.value || '');
    }
    else if (currentTab === 'application') {
        applicationGroups.forEach(g => html += createApplicationCard(g));
    }

    grid.innerHTML = html;
}

// 그룹 카드 생성 함수
function createGroupCard(g) {
    return `
    <div class="group_card" onclick="viewGroup('${g.id}')">
        <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${g.id}')">⋯</div>
        <div class="card_image" style="background-image:url('${g.imageUrl}')"></div>
        <div class="profile_avatar" style="background-image:url('${g.avatarUrl}')"></div>
        <div class="card_info"><span class="card_title">${g.title}</span></div>
    </div>`;
}

// 가입 현황 카드 생성 함수
function createApplicationCard(g) {
    const statusText = g.status === 'pending' ? '가입 대기중' : g.status === 'approved' ? '가입 승인' : '가입 거절';
    return `
    <div class="group_card ${g.status}" onclick="viewGroup('${g.id}')">
        <span class="status_badge ${g.status}">${statusText}</span>
        <div class="card_menu" onclick="event.stopPropagation(); openGroupMenu('${g.id}')">⋯</div>
        <div class="card_image" style="background-image:url('${g.imageUrl}')"></div>
        <div class="profile_avatar" style="background-image:url('${g.avatarUrl}')"></div>
        <div class="card_info"><span class="card_title">${g.title}</span></div>
    </div>`;
}

// 검색 기능
function searchGroups() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.group_card').forEach(card => {
        if (card.classList.contains('create_card')) return;
        const title = card.querySelector('.card_title').textContent.toLowerCase();
        card.style.display = title.includes(term) ? 'block' : 'none';
    });
}

// 키워드 필터
function filterByKeyword(keyword) {
    if (currentTab !== 'all') return;
    document.querySelectorAll('.group_card').forEach(card => {
        if (card.classList.contains('create_card')) return;
        const title = card.querySelector('.card_title').textContent;
        let show = !keyword;
        if (keyword === 'breed') show = /푸들|리트리버|골든|종|품종/.test(title);
        if (keyword === 'area') show = /동네|산책|지역|근처/.test(title);
        if (keyword === 'training') show = /훈련|교육|스터디|배우|발랄/.test(title);
        card.style.display = show ? 'block' : 'none';
    });
}

// 모달: 그룹 생성 흐름
function openModal() {
    showStep(1);
    document.getElementById('createGroupModal').classList.add('show');
    selectedInterest = null;
    updateNextButton();
}
function closeModal() {
    document.getElementById('createGroupModal').classList.remove('show');
    resetForm();
}
function showStep(n) {
    document.querySelectorAll('.modal_step').forEach(s => s.style.display = 'none');
    document.getElementById('step' + n).style.display = 'block';
}
function prevStep(n) { showStep(n); }
function nextStep(n) { showStep(n); }

// 관심사 선택
function selectInterest(interest) {
    document.querySelectorAll('.interest_card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-interest="${interest}"]`).classList.add('selected');
    selectedInterest = interest;
    updateNextButton();
}
function updateNextButton() {
    document.getElementById('nextStep1').disabled = !selectedInterest;
}

// AJAX: 그룹 생성
function createNewGroup() {
    const nameEl = document.getElementById('groupName');
    const infoEl = document.getElementById('groupInfo');
    const dogEl  = document.getElementById('dogSelect');
    if (!nameEl || !dogEl) { alert('입력 폼 오류'); return; }

    const name = nameEl.value.trim();
    const info = infoEl ? infoEl.value.trim() : '';
    const dogId = dogEl.value;

    if (!selectedInterest || !name) {
        alert('필수 항목을 입력해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('interest', selectedInterest);
    formData.append('gname', name);
    formData.append('groupInfo', info);
    formData.append('dogId', dogId);

    fetch('/groups/create', { method: 'POST', body: formData })
        .then(res => res.ok ? res.text() : Promise.reject('그룹 생성에 실패했습니다.'))
        .then(() => window.location.reload())
        .catch(err => alert(err));
}

// 기타 유틸
function viewGroup(id) { window.location.href = `/groups/${id}`; }
function openGroupMenu(id) { /* TODO: 메뉴 표시 */ }
function resetForm() {
    selectedInterest = null;
    document.querySelectorAll('.interest_card').forEach(c => c.classList.remove('selected'));
    const nm = document.getElementById('groupName'); if (nm) nm.value = '';
    const gi = document.getElementById('groupInfo'); if (gi) gi.value = '';
}
