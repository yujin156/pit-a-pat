document.addEventListener('DOMContentLoaded', function() {
    let stompClient = null;
    let isConnected = false;
    let currentUser = null;
    let partnerInfo = null;
    let typingTimer = null;

    // DOM 요소들
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const attachmentBtn = document.getElementById('attachmentBtn');
    const fileInput = document.getElementById('fileInput');
    const connectionStatus = document.getElementById('connectionStatus');
    const typingIndicator = document.getElementById('typingIndicator');
    const partnerName = document.getElementById('partnerName');
    const partnerAvatar = document.getElementById('partnerAvatar');
    const partnerStatus = document.getElementById('partnerStatus');
    const closeBtn = document.getElementById('closeBtn');

    // 초기화
    init();

    function init() {
        setupEventListeners();
        loadInitialMessages();
        connectWebSocket();
        loadPartnerInfo();
        markMessagesAsRead();
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
        // 메시지 전송
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // 파일 첨부
        attachmentBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', handleFileUpload);

        // 창 닫기
        closeBtn.addEventListener('click', () => {
            window.close();
        });

        // 타이핑 감지
        messageInput.addEventListener('input', handleTyping);

        // 페이지 언로드 시 WebSocket 연결 해제
        window.addEventListener('beforeunload', () => {
            if (stompClient && isConnected) {
                stompClient.disconnect();
            }
        });
    }

    // WebSocket 연결
    function connectWebSocket() {
        updateConnectionStatus('connecting', '연결 중...');

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        // 디버그 로그 비활성화
        stompClient.debug = null;

        stompClient.connect({},
            function(frame) {
                console.log('WebSocket 연결 성공:', frame);
                isConnected = true;
                updateConnectionStatus('connected', '연결됨');

                // 채팅방 구독
                stompClient.subscribe(`/topic/chat/${friendRequestId}`, function(message) {
                    const messageData = JSON.parse(message.body);
                    addMessageToChat(messageData, false);
                });
            },
            function(error) {
                console.error('WebSocket 연결 실패:', error);
                isConnected = false;
                updateConnectionStatus('disconnected', '연결 실패');

                // 재연결 시도
                setTimeout(connectWebSocket, 3000);
            }
        );
    }

    // 연결 상태 업데이트
    function updateConnectionStatus(status, text) {
        connectionStatus.className = `connection_status ${status}`;
        connectionStatus.querySelector('.status_text').textContent = text;
    }

    // 초기 메시지 로드
    function loadInitialMessages() {
        if (initialMessages && initialMessages.length > 0) {
            initialMessages.forEach(message => {
                addMessageToChat(message, true);
            });
            scrollToBottom();
        } else {
            showEmptyChat();
        }
    }

    // 파트너 정보 로드
    function loadPartnerInfo() {
        // 초기 메시지에서 파트너 정보 추출
        if (initialMessages && initialMessages.length > 0) {
            const firstMessage = initialMessages[0];
            const isMyMessage = checkIfMyMessage(firstMessage);

            if (!isMyMessage) {
                updatePartnerInfo(firstMessage.senderDog);
            } else {
                // 상대방 메시지 찾기
                const partnerMessage = initialMessages.find(msg => !checkIfMyMessage(msg));
                if (partnerMessage) {
                    updatePartnerInfo(partnerMessage.senderDog);
                }
            }
        }
    }

    // 파트너 정보 업데이트
    function updatePartnerInfo(dogInfo) {
        if (dogInfo) {
            partnerName.textContent = dogInfo.dname || '친구';
            if (dogInfo.image && dogInfo.image.diurl) {
                partnerAvatar.style.backgroundImage = `url('${dogInfo.image.diurl}')`;
            }
            partnerStatus.textContent = '온라인';
            partnerInfo = dogInfo;
        }
    }

    // 내 메시지인지 확인
    function checkIfMyMessage(message) {
        // 실제 구현에서는 현재 로그인한 사용자의 강아지 ID와 비교
        // 임시로 최근 메시지 기준으로 판단
        return false; // 이 부분은 서버에서 처리하거나 세션 정보 활용 필요
    }

    // 메시지 전송
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText || !isConnected) {
            console.log('메시지가 비어있거나 연결되지 않음');
            return;
        }

        console.log('메시지 전송 시도:', messageText);

        // 서버로 메시지 전송
        fetch(`/api/chat/${friendRequestId}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: messageText })
        })
            .then(response => {
                console.log('서버 응답 상태:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('서버 응답 데이터:', data);
                if (data.success) {
                    messageInput.value = '';
                    // WebSocket으로 실시간 전송도 시도
                    if (stompClient && isConnected) {
                        stompClient.send(`/app/chat/${friendRequestId}`, {},
                            JSON.stringify({
                                message: messageText,
                                senderEmail: getCurrentUserEmail() // 이 함수 구현 필요
                            })
                        );
                    }
                } else {
                    showError(data.message || '메시지 전송 실패');
                }
            })
            .catch(error => {
                console.error('메시지 전송 실패:', error);
                showError('메시지 전송에 실패했습니다.');
            });
    }
// 현재 사용자 이메일 가져오기 함수 추가 필요
    function getCurrentUserEmail() {
        // 서버에서 렌더링할 때 전역 변수로 설정하거나
        // 별도 API로 가져오기
        return window.currentUserEmail || null;
    }

    // 채팅에 메시지 추가
    function addMessageToChat(messageData, isInitial = false, isMyMessage = null) {
        const messageDiv = document.createElement('div');
        const isFromMe = isMyMessage !== null ? isMyMessage : checkIfMyMessage(messageData);

        messageDiv.className = `message ${isFromMe ? 'sent' : 'received'}`;

        const time = formatMessageTime(messageData.sentAt || messageData.sent_at);

        let avatarHtml = '';
        if (!isFromMe && messageData.senderDog) {
            const avatarUrl = messageData.senderDog.image?.diurl || '/img/default-dog.png';
            avatarHtml = `<div class="message_avatar" style="background-image: url('${avatarUrl}')"></div>`;
        }

        messageDiv.innerHTML = `
            ${avatarHtml}
            <div class="message_content">
                <div class="message_bubble">
                    ${escapeHtml(messageData.message)}
                </div>
                <div class="message_time">${time}</div>
                ${isFromMe ? '<div class="message_status">전송됨</div>' : ''}
            </div>
        `;

        chatMessages.appendChild(messageDiv);

        if (!isInitial) {
            scrollToBottom();
        }
    }

    // 빈 채팅 표시
    function showEmptyChat() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty_chat';
        emptyDiv.innerHTML = `
            <div class="empty_chat_icon">💬</div>
            <div>첫 메시지를 보내보세요!</div>
        `;
        chatMessages.appendChild(emptyDiv);
    }

    // 파일 업로드 처리
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB 제한
            showError('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        // 이미지 업로드 구현 (추후 확장)
        showError('이미지 업로드 기능은 준비 중입니다.');
    }

    // 타이핑 처리
    function handleTyping() {
        // 타이핑 상태 전송 (추후 구현)
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            // 타이핑 중지 상태 전송
        }, 1000);
    }

    // 메시지 읽음 처리
    function markMessagesAsRead() {
        fetch(`/api/chat/${friendRequestId}/mark-read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .catch(error => {
                console.error('읽음 처리 실패:', error);
            });
    }

    // 스크롤을 맨 아래로
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 시간 포맷팅
    function formatMessageTime(timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            // 오늘인 경우 시간만 표시
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } else {
            // 다른 날인 경우 날짜와 시간 표시
            return date.toLocaleString('ko-KR', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    }

    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 에러 표시
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'system_message';
        errorDiv.textContent = message;
        chatMessages.appendChild(errorDiv);
        scrollToBottom();

        // 3초 후 제거
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    // 날짜 구분선 추가
    function addDateSeparator(date) {
        const separatorDiv = document.createElement('div');
        separatorDiv.className = 'date_separator';

        const dateText = new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        separatorDiv.innerHTML = `<span class="date_text">${dateText}</span>`;
        chatMessages.appendChild(separatorDiv);
    }

    // 전역 함수로 내보내기 (디버깅용)
    window.chatFunctions = {
        sendMessage,
        connectWebSocket,
        markMessagesAsRead,
        addMessageToChat
    };
});