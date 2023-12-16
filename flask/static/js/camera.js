// 웹캠을 선택할 수 있는 드롭다운 목록 요소
var select = document.getElementById("cameraSelect");

// 미디어 장치 목록 가져오기 및 드롭다운 목록 채우기
async function getCameraList() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        devices.forEach(device => {
            if (device.kind === 'videoinput') {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `카메라 ${select.options.length + 1}`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('미디어 장치 목록을 가져오는 중 오류가 발생했습니다: ', error);
    }
}

// 페이지 로딩 시 미디어 장치 목록 가져오기
getCameraList();

// 선택한 카메라 옵션을 서버로 보내기
select.addEventListener('change', () => {
    const selectedCameraIndex = select.selectedIndex;

    // 선택한 값을 Flask 서버로 보내기
    fetch('/dancescoring/rec/send_selection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedCameraIndex })
    })
    .then(response => response.json())
    .then(data => {
        // 서버로부터의 응답 처리
        console.log(data);
    })
    .catch(error => {
        console.error('서버 요청 중 오류가 발생했습니다: ', error);
    });
});


// 토글 체크 여부로 웹캠 켜고 끄기
// 토글 요소 가져오기
function toggleRecord() {
    fetch('/dancescoring/rec/toggle_record')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Recording status:', data.recording);

                // 녹화 중지일 경우 비디오 멈추기
                if(!data.recording){
                }
            } else {
                console.error('Failed to toggle recording');
            }
        });
}

// 시간 위치 보내기
const video = document.getElementById("target_video");
let interval;

document.getElementById('startBtn').addEventListener('click', function() {
    video.play();
    interval = setInterval(function() {
        const currentTime = video.currentTime;
        fetch("/dancescoring/rec/update_time", {
            method: "POST",
            body: JSON.stringify({ currentTime: currentTime }),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }, 50);
});

document.getElementById('pauseBtn').addEventListener('click', function() {
    // When the PAUSE button is clicked, stop sending updates by clearing the interval
    clearInterval(interval);
    video.pause();
});