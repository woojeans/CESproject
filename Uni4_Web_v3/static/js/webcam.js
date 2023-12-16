const cameraSelect = document.getElementById('cameraSelect');
const videoOn = document.getElementById('toggle');
const webcam = document.getElementById('webcam');
const media_cam = document.getElementById('media_cam');
const webcamcanvas = document.getElementById('webcamCanvas')

const videoElement = document.getElementById("target_video");
const canvasElement = document.getElementById("target_outputCanvas");
const scoreElement = document.getElementById("score");
let user_landmarks = null;


const animatable = document.getElementById("animatable");
const scoreTermValue = document.getElementById("scoreTermValue");


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

videoOn.addEventListener('change', function () {
    if (this.checked) {
        startCamera();
    } else {
        stopCamera();
    }
});

function startCamera() {
    if (!cameraRunning) {
      webcamcanvas.style.display = "block";
        var stream = null;
        const selectedCameraId = cameraSelect.value;
        
        // 웹캠 열기
        navigator.mediaDevices.getUserMedia({ video: {deviceId: selectedCameraId} })
        .then(function (cameraStream) {
            stream = cameraStream;
            webcam.srcObject = cameraStream;
            camera.start();
        });
    cameraRunning = true;
    // animatable.style.display = "block";
    // scoreTermValue.style.animation = "fontAnimation 0.5s linear 2";
    }
}

function stopCamera() {
    if(cameraRunning){
      // 웹캠1 끄기
      const stream = webcam.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcam.srcObject = null;

      // 웹캠2 끄기
      const stream2 = media_cam.srcObject;
      const tracks2 = stream2.getTracks();
      tracks2.forEach(tracks2 => tracks2.stop());
      media_cam.srcObject = null;

      // canvas 숨기기
      webcamcanvas.style.display = "none";
      user_landmarks = null;
      scoreElement.textContent = "0";
      cameraRunning = false;
      animatable.style.display = "none";
    }
}

// 스타트 버튼 누를때 동작
let countdownValue = 3;

function startCountdown() {
  document.getElementById('startDialogBtn').style.display = 'none';
  document.getElementById('countdown').style.display = 'block';
  // totalscore.style.display = 'none';
  let countdown = setInterval(function() {
    countdownValue--;
    document.getElementById('countdown').textContent = countdownValue;
    if (countdownValue <= 0) {
      clearInterval(countdown);
      document.getElementById('startDialog').style.display = 'none';
      animatable.style.display = "block";
      document.getElementById('target_video').play();
    }
  }, 1000);
  scoreTermValue.style.animation = "fontAnimation 0.5s linear 2";
  document.getElementById("firework").style.display = "block";
}

// 재생이 끝났을 때 이벤트 리스너 추가
videoElement.addEventListener("ended", function() {
  // 해당 요소 가져오기
  var startDialog = document.getElementById("startDialog");
  var startDialogBtn = document.getElementById("startDialogBtn");
  var countdown = document.getElementById("countdown");
  var restartDialogBtn = document.getElementById("restartDialogBtn");
  var resulttDialogBtn = document.getElementById("resulttDialogBtn");
  
  // 기존 스타일 유지하면서 display 속성 추가
  startDialog.style.display = "flex";
  startDialogBtn.style.display = "none";
  countdown.style.display = "none";
  restartDialogBtn.style.display = "block";
  resulttDialogBtn.style.display = "block";

  animatable.style.display = "none";
  // totalscore.style.display = "block";

  // if (scoreList.length > 0) {
  //   // 배열 요소의 합 계산
  //   const sum = scoreList.reduce((acc, current) => acc + current, 0);
  
  //   // 평균 계산
  //   const average = sum / scoreList.length;
  
  //   scoreTermValue.textContent = Math.floor(average);
  //   console.log(scoreTermValue.textContent);
  // } else {
  //   console.log("scoreList가 비어 있습니다.");
  // }
});


// 리스타트 함수
function restartVideo() {
  var video = document.getElementById("target_video");
  video.currentTime = 0; // 동영상을 처음으로 되감기
  video.play(); // 동영상 재생
  document.getElementById("startDialog").style.display = "none";
  animatable.style.display = "block";
  totalscore.style.display = 'none';
}

// 사용자 포즈 검출
const camera = new Camera(media_cam, {
  onFrame: async () => {
    await user_pose.send({ image: webcam });
  },
});

const user_pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
  });

  user_pose.setOptions({
    upperBodyOnly: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  user_pose.onResults((user_results) => {
    webcamcanvas.width = webcam.width;
    webcamcanvas.height = webcam.height;
    const canvasCtx_user = webcamcanvas.getContext("2d");
    canvasCtx_user.save();
    canvasCtx_user.clearRect(0, 0, webcam.width, webcam.height);
    canvasCtx_user.drawImage(user_results.image, 0, 0, webcam.width, webcam.height);
    user_landmarks = user_results.poseLandmarks;
    if (user_results.poseLandmarks) {
      // 관절 연결
      drawConnectors(canvasCtx_user, user_landmarks, POSE_CONNECTIONS, {
        color: 'white',
        lineWidth: 5,
      });

      // 왼쪽 관절 주황색
      drawLandmarks(canvasCtx_user, Object.values(POSE_LANDMARKS_LEFT).map(index=>user_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(255,138,0)',
      })

      // 오른쪽 관절 파란색
      drawLandmarks(canvasCtx_user, Object.values(POSE_LANDMARKS_RIGHT).map(index=>user_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(0,217,231)',
      })
    }
    canvasCtx_user.restore();
  });


// target
async function processVideo() {
    await pose.send({ image: videoElement });
    requestAnimationFrame(processVideo);
}

// Pose Detection 모델 호출
const pose = new Pose({
    locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
});

// Pose Detection 설정
pose.setOptions({
    upperBodyOnly: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

// Pose Detection 콜백 함수 설정
pose.onResults((results) => {
    canvasElement.width = videoElement.width;
    canvasElement.height = videoElement.height;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoElement.width, videoElement.height);
    canvasCtx.drawImage(
    results.image, 0, 0, videoElement.width, videoElement.height);
    if (results.poseLandmarks) {
    const landmarks = results.poseLandmarks;

      if (user_landmarks == null){
        scoreElement.textContent = 0;
      } else {
        const target_lm = landmarks.map((i) => [i.x, i.y, i.z]);
        const user_lm = user_landmarks.map((i) => [i.x, i.y, i.z]);

        // 정규화
        const target_norm = minMaxNormalization(target_lm);
        const user_norm = minMaxNormalization(user_lm);

        // 점수
        const score = getScore(target_norm, user_norm);
        scoreElement.textContent = "" + score;
      }
    }
    canvasCtx.restore();
});
processVideo();

function minMaxNormalization(data, newMin = 0, newMax = 1) {
  const numCols = data[0].length; // 열의 수

  for (let col = 0; col < numCols; col++) {
    const column = data.map(row => row[col]); // 열 데이터 추출
    const min = Math.min(...column); // 열의 최소값
    const max = Math.max(...column); // 열의 최대값

    for (let i = 0; i < data.length; i++) {
      data[i][col] = newMin + ((data[i][col] - min) * (newMax - newMin)) / (max - min);
    }
  }

  return data;
}

function getScore(target_lm, user_lm) {
  let cosineSimilarities = [];

  for (let i = 0; i < target_lm.length; i++) {
    let dotProduct = 0;
    let normX = 0;
    let normY = 0;

    for (let j = 0; j < target_lm[i].length; j++) {
      dotProduct += target_lm[i][j] * user_lm[i][j];
      normX += Math.pow(target_lm[i][j], 2);
      normY += Math.pow(user_lm[i][j], 2);
    }

    normX = Math.sqrt(normX);
    normY = Math.sqrt(normY);

    const cosineSimilarity = dotProduct / (normX * normY);
    cosineSimilarities.push(cosineSimilarity);
  }

  let sum = cosineSimilarities.reduce((acc, val) => acc + val, 0);
  let meanCosineSimilarity = sum / cosineSimilarities.length;

  return Math.ceil(meanCosineSimilarity*10000)/100;
}


// 점수처리 애니매이션
animatable.autoPlay = true;
animatable.animation = "bounceIn";
const scoreValue = document.getElementById("score");
let scoreList = [];
setInterval(() => {
  scoreTermValue.textContent = Math.floor(scoreValue.textContent);
  scoreList.push(scoreTermValue.textContent);
  animatable.play();
  if (Number(scoreValue.textContent) < 60) {
    scoreTermValue.style.color = "white";
  } else if (Number(scoreValue.textContent) < 70) {
    scoreTermValue.style.color = "#52b79a";
  } else if (Number(scoreValue.textContent) < 80) {
    scoreTermValue.style.color = "#ffdd57";
  } else if (Number(scoreValue.textContent) < 90) {
    scoreTermValue.style.color = "#ff9100";
  } else {
    scoreTermValue.style.color = "#f05164";
  }
}, 1000);

// 폭죽 효과
const fRandomValue = [0, 0, 0, 0, 0];
const speed = 0.7; // 더 빠르게 폭죽이 터지게 하고 싶은경우 값을 낮추기
fRandomValue.forEach((value, i) => {
  fRandomValue[i] = Math.floor(Math.random() * 10) / 10 + speed;

  setInterval(() => {
    // 점수에 따라 폭죽 효과를 보여주거나 숨깁니다.
    if (Number(scoreValue.textContent) >= 75) {
      document.getElementById("firework").style.display = "block";
    } else {
      document.getElementById("firework").style.display = "none";
    }

    // 폭죽 효과 애니메이션을 설정합니다.
    document.getElementsByClassName(`firework${i + 1}`)[0].style.top =
      Math.floor(Math.random() * 100).toString() + "%";
    document.getElementsByClassName(`firework${i + 1}`)[0].style.left =
      Math.floor(Math.random() * 100).toString() + "%";
    document.getElementsByClassName(`firework${i + 1}`)[0].style.animation = `firework${i + 1} ${fRandomValue[i].toString()}s infinite`;
    document.getElementsByClassName(`firework${i + 1}`)[0].style.animationDelay = "0.2s";
  }, fRandomValue[i] * 1000);
});