const cameraSelect = document.getElementById('cameraSelect');
const videoOn = document.getElementById('toggle');
const webcam = document.getElementById('webcam');


// 웹캠 목록을 가져오고 선택 목록을 채우는 함수
async function getWebcamList(){
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    videoDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${cameraSelect.length + 1}`;
        cameraSelect.appendChild(option);
    });
}

getWebcamList();

// 웹캠 켜고 끄기
let cameraRunning = false;
var socket = io.connect('http://' + document.domain + ':' + location.port);

videoOn.addEventListener('change', function () {
    if (this.checked) {
        startCamera();
    } else {
        stopCamera();
    }
});

function startCamera() {
    if (!cameraRunning) {
        var stream = null;
        const selectedCameraId = cameraSelect.value;

        // 웹캠 열기
        navigator.mediaDevices.getUserMedia({ video: {deviceId: selectedCameraId} })
        .then(function (cameraStream) {
            stream = cameraStream;
            webcam.srcObject = cameraStream;

            // 프레임 전송 루프 시작
            frameSender = requestAnimationFrame(sendFrame);

            // 비디오 좌우 반전 클래스 추가
            webcam.classList.add('flip-webcam');
        });

    cameraRunning = true;
    }
}

function stopCamera() {
    if(cameraRunning){
        const stream = webcam.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        webcam.srcObject = null;
        cameraRunning = false;

        // 프레임 전송 루프 중지
        cancelAnimationFrame(frameSender);
    }
}

function sendFrame(){
    // 프레임 전송
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
    const frame = canvas.toDataURL('image/jpeg', 1.0);

    socket.emit('frame', frame);

    // 프레임 전송 루프 계속 실행
    frameSender = requestAnimationFrame(sendFrame);
}