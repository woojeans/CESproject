const socket = io.connect('http://' + document.domain + ':' + location.port);

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.getElementById('preview');
        video.srcObject = stream;
        setInterval(() => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/jpeg');
            socket.emit('image', imgData);
        }, 100); // 0.1초에 한 번씩 이미지를 전송
    })
    .catch(error => console.error('Error accessing webcam:', error));

// 실시간으로 처리된 이미지를 받아서 표시
socket.on('processed_image', processedImgData => {
    const processedImg = document.getElementById('processed_image');
    processedImg.src = 'data:image/jpeg;base64,' + processedImgData;
});