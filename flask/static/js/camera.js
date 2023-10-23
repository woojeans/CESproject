//DOM
const recordButton =document.querySelector(".record-button");
const stopButton =document.querySelector(".stop-button");
const playButton =document.querySelector(".play-button");
const downloadButton =document.querySelector(".download-button");
 
const previewPlayer = document.querySelector("#preview");
const recordingPlayer = document.querySelector("#recording");

const video1 = document.getElementById('video1');
 
let recorder;
let recordedChunks;
 
//functions
function videoStart() {
    navigator.mediaDevices.getUserMedia({ video:true,audio:true })
    .then(stream => {
        previewPlayer.srcObject = stream;
        startRecording(previewPlayer.captureStream())
    })
    
}
 
function startRecording(stream) {
    recordedChunks=[];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e)=>{ recordedChunks.push(e.data) }
    recorder.start();
    recordButton.disabled=true;
    stopButton.disabled=false;
    video1.play();
}
 
function stopRecording() {
    previewPlayer.srcObject.getTracks().forEach(track => track.stop());
    recorder.stop();
    recordButton.disabled=false;
    stopButton.disabled=true;
    video1.pause();
}
 
function downloadRecording() {
    const recordedBlob = new Blob(recordedChunks, {type:"video/webm"});
    const downloadUrl = URL.createObjectURL(recordedBlob);

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `webcam_recording_${new Date()}.webm`;
    a.click();
    
    // Clean up
    URL.revokeObjectURL(downloadUrl);
    recordedChunks = [];

    // recordingPlayer.src=URL.createObjectURL(recordedBlob);
    // recordingPlayer.play();
    // downloadButton.href=recordingPlayer.src;
    // downloadButton.download =`recording_${new Date()}.webm`;
    // console.log(recordingPlayer.src);
}

function toggleRecord() {
    fetch('/dancescoring/rec/toggle_record')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Recording status:', data.recording);

                // 녹화 중지일 경우 비디오 멈추기
                if(!data.recording){
                    video1.pause();
                }
            } else {
                console.error('Failed to toggle recording');
            }
        });
    video1.play();
}

function downloadVideo() {
    window.location.href = '/dancescoring/rec/download_video';
}
 
//event
recordButton.addEventListener("click",videoStart);
stopButton.addEventListener("click",stopRecording);
downloadButton.addEventListener("click",downloadRecording);