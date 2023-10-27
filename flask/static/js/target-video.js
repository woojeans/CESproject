const video = document.getElementById('target_video');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 비디오의 현재 위치를 업데이트하는 함수
function updateCurrentTime() {
    // Flask 서버로 현재 위치(시간)을 보내는 POST 요청
    fetch('/update_time', {
        method: 'POST',
        body: JSON.stringify({ currentTime: video.currentTime }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

// 비디오가 재생 중일 때 매 초마다 위치 업데이트
video.addEventListener('timeupdate', updateCurrentTime);

// 서버로부터 score 값을 받아서 html에 업데이트
socket.on('score', function(data) {
    document.getElementById('score').textContent = data.score;
});

// 버튼 클릭 시 비디오를 시작하도록 이벤트 리스너를 추가합니다
startBtn.addEventListener('click', function() {
    video.play(); // 비디오를 시작합니다
});

// PAUSE 버튼 클릭 시 비디오를 일시 정지하도록 이벤트 리스너를 추가합니다
pauseBtn.addEventListener('click', function() {
    video.pause(); // 비디오를 일시 정지합니다
});