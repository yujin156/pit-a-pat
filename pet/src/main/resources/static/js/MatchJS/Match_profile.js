document.addEventListener('DOMContentLoaded', function() {
    // 매칭 프로필 관련 JavaScript

    // 하트 버튼 클릭 이벤트
    function initMatchProfileHearts() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('.heart_btn')) {
                const heartBtn = e.target.closest('.heart_btn');
                const dogId = heartBtn.dataset.dogId;
                handleMatchHeartClick(heartBtn, dogId);
            }
        });
    }

    // 매칭 프로필 하트 클릭 처리
    function handleMatchHeartClick(heartBtn, dogId) {
        // 이미 좋아요한 경우
        if (heartBtn.classList.contains('liked')) {
            return;
        }

        // 애니메이션 추가
        heartBtn.classList.add('animate');

        // 좋아요 API 호출
        fetch('/api/match/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                targetDogId: parseInt(dogId)
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 하트 색상 변경
                    heartBtn.classList.add('liked');

                    // 성공 메시지 표시
                    if (data.isMatched) {
                        showMatchNotification('🎉 매칭 성사! 친구가 되었습니다!', 'success');
                    } else {
                        showMatchNotification('💖 좋아요를 보냈습니다!', 'success');
                    }
                } else {
                    showMatchNotification(data.message || '좋아요 처리에 실패했습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('좋아요 처리 실패:', error);
                showMatchNotification('오류가 발생했습니다.', 'error');
            })
            .finally(() => {
                // 애니메이션 클래스 제거
                setTimeout(() => {
                    heartBtn.classList.remove('animate');
                }, 600);
            });
    }

    // 매칭 알림 표시
    function showMatchNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.match-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 알림 색상 설정
        let bgColor = '#387FEB';
        if (type === 'success') bgColor = '#4CAF50';
        if (type === 'error') bgColor = '#f44336';

        // 알림 엘리먼트 생성
        const notification = document.createElement('div');
        notification.className = 'match-notification';
        notification.innerHTML = message;
        notification.matchProfileStyle .cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${bgColor};
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideDownNotification 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // 3초 후 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.matchProfileStyle .animation = 'slideUpNotification 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // 프로필 카드 로드 완료 시 이벤트 설정
    function initMatchProfile() {
        initMatchProfileHearts();

        // 비회원 하트 클릭 방지
        document.addEventListener('click', function(e) {
            if (e.target.closest('.profile_hart_icon.disabled')) {
                e.preventDefault();
                showMatchNotification('로그인하시면 마음에 드는 강아지에게 좋아요를 보낼 수 있어요!', 'info');
            }
        });
    }

    // 초기화
    initMatchProfile();

    // 전역으로 내보내기 (다른 스크립트에서 사용 가능)
    window.MatchProfile = {
        init: initMatchProfile,
        handleHeartClick: handleMatchHeartClick,
        showNotification: showMatchNotification
    };
});

// 애니메이션 CSS 추가
const matchProfileStyle  = document.createElement('style');
matchProfileStyle .textContent = `
    @keyframes slideDownNotification {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUpNotification {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(matchProfileStyle );