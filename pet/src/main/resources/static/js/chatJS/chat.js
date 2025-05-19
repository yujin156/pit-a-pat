// // 전역 변수
// let stompClient = null;
// let currentUser = null;
//
// // 페이지 로드 시 이벤트 리스너 설정
// document.addEventListener('DOMContentLoaded', function() {
//     // 폼 제출 이벤트
//     document.getElementById('message-form').addEventListener('submit', function(e) {
//         e.preventDefault();
//         sendMessage();
//     });
//
//     // 엔터키 처리
//     document.getElementById('message-input').addEventListener('keypress', function(e) {
//         if (e.key === 'Enter') {
//             e.preventDefault();
//             sendMessage();
//         }
//     });
//
//     // 로그 초기화
//     log('페이지 로드 완료. 유저를 선택해주세요.');
// });
//
// // 유저 선택 함수
// function selectUser(userId) {
//     // 유저 선택 UI 업데이트
//     document.querySelectorAll('.user-btn').forEach(btn => {
//         btn.classList.remove('active');
//     });
//     document.querySelectorAll('.user-btn')[userId-1].classList.add('active');
//
//     // 현재 유저 설정
//     currentUser = userId;
//     document.getElementById('selected-user').innerText =
//         `선택된 유저: ${userId === 1 ? '멍이' : '멍멍이'} (ID: ${userId})`;
//
//     // 기존 연결 종료
//     if (stompClient !== null && stompClient.connected) {
//         stompClient.disconnect();
//         log('이전 연결 종료됨');
//     }
//
//     // 새 연결 설정
//     connect();
//
//     // 입력창 활성화
//     document.getElementById('message-input').disabled = false;
//     document.getElementById('message-input').focus();
//
//     // 채팅창 초기화
//     document.getElementById('chat-box').innerHTML = '';
// }
//
// // WebSocket 연결 함수
// function connect() {
//     if (!currentUser) {
//         log('유저를 선택해주세요.');
//         return;
//     }
//
//     log(`유저 ${currentUser} 연결 시도 중...`);
//
//     // WebSocket 연결
//     const socket = new SockJS('/ws');
//     stompClient = Stomp.over(socket);
//
//     // 연결 시도
//     stompClient.connect({},
//         // 성공 콜백
//         function() {
//             log(`WebSocket 연결 성공! 수신 채널: /topic/chat/${currentUser}`);
//
//             // 중요: 자신의 ID로 구독해야 메시지를 받을 수 있음
//             stompClient.subscribe(`/topic/chat/${currentUser}`, function(message) {
//                 const received = JSON.parse(message.body);
//                 log(`메시지 수신: ${received.mChat} (보낸 사람: ${received.senderDogName})`);
//
//                 // 받은 메시지 표시
//                 displayMessage(received, false);
//             });
//         },
//         // 오류 콜백
//         function(error) {
//             log(`WebSocket 연결 오류: ${error}`);
//         }
//     );
// }
//
// // 메시지 전송 함수
// function sendMessage() {
//     const messageInput = document.getElementById('message-input');
//     const messageText = messageInput.value.trim();
//
//     if (!messageText) return;
//     if (!currentUser) {
//         log('유저를 선택해주세요.');
//         return;
//     }
//     if (!stompClient || !stompClient.connected) {
//         log('WebSocket 연결이 없습니다. 다시 연결해주세요.');
//         connect();
//         return;
//     }
//
//     // 상대방 ID 계산 (1→2, 2→1)
//     const receiverId = currentUser === 1 ? 2 : 1;
//
//     // 메시지 객체 생성
//     const chatMessage = {
//         senderDId: currentUser,
//         receiverDId: receiverId,
//         mChat: messageText,
//         type: 'TALK'
//     };
//
//     log(`메시지 전송: ${messageText} (→ 유저 ${receiverId})`);
//
//     // WebSocket으로 메시지 전송
//     stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
//
//     // 내 화면에 바로 표시
//     displayMessage({
//         senderDId: currentUser,
//         senderDogName: currentUser === 1 ? '멍이' : '멍멍이',
//         mChat: messageText,
//         mNowdate: new Date().toLocaleTimeString()
//     }, true);
//
//     // 입력창 초기화
//     messageInput.value = '';
//     messageInput.focus();
// }
//
// // 메시지 표시 함수
// function displayMessage(message, isSent) {
//     const chatBox = document.getElementById('chat-box');
//     const messageElement = document.createElement('div');
//
//     // 메시지 스타일 설정
//     messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
//
//     // 발신자 이름과 시간 가져오기
//     const senderName = message.senderDogName ||
//         (message.senderDId === 1 ? '멍이' : '멍멍이');
//     const time = message.mNowdate || new Date().toLocaleTimeString();
//
//     // 메시지 내용 설정
//     messageElement.innerHTML = `
//         <strong>${senderName}</strong>
//         <p>${message.mChat}</p>
//         <small>${time}</small>
//     `;
//
//     // 채팅창에 추가
//     chatBox.appendChild(messageElement);
//     chatBox.scrollTop = chatBox.scrollHeight;
// }
//
// // 로그 함수
// function log(message) {
//     const logs = document.getElementById('logs');
//     const time = new Date().toLocaleTimeString();
//     logs.innerHTML += `<div>[${time}] ${message}</div>`;
//     logs.scrollTop = logs.scrollHeight;
// }