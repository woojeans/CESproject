from flask import Flask, render_template, request, Response, send_file
from datetime import datetime

import cv2
import mediapipe as mp
import numpy as np
import os

from pyngrok import conf, ngrok

app = Flask(__name__)

# 웹캠 캡처 객체 및 녹화 상태 변수
video_capture = cv2.VideoCapture(1)
recording = False
frames = []

# 포즈 감지 모델 초기화
mp_pose = mp.solutions.pose
pose_video = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.7,
                          min_tracking_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# 포즈 검출 함수
def detectPose(image_pose, pose, draw=False):
    
    original_image = image_pose.copy()
    
    image_in_RGB = cv2.cvtColor(image_pose, cv2.COLOR_BGR2RGB)
    
    resultant = pose.process(image_in_RGB)

    if resultant.pose_landmarks and draw:    

        mp_drawing.draw_landmarks(image=original_image, landmark_list=resultant.pose_landmarks,
                                  connections=mp_pose.POSE_CONNECTIONS,
                                  landmark_drawing_spec=mp_drawing.DrawingSpec(color=(255,255,255),
                                                                               thickness=3, circle_radius=3),
                                  connection_drawing_spec=mp_drawing.DrawingSpec(color=(49,125,237),
                                                                               thickness=2, circle_radius=2))
    return original_image, resultant

# 웹캠 프레임 생성 함수
def generate_frames():
    while True:
        # 녹화 중일 때만 프레임 읽기
        if recording:
            success, frame = video_capture.read()
            if not success:
                break

            # 이미지 좌우 반전
            flipped_image = cv2.flip(frame, 1)
            
            test_frame, _ = detectPose(flipped_image, pose_video, True)

            # 프레임을 JPEG 형식으로 인코딩
            ret, buffer = cv2.imencode('.jpg', test_frame)
            frame = buffer.tobytes()
            
            frames.append(frame)

            # 프레임 반환
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

# 춤채점
@app.route('/dancescoring')
def menu1():
    video_dir = './static/dance/images'
    video_cover = os.listdir(video_dir)
    return render_template('dancescoring.html', video_cover=video_cover)

# 영상 녹화
@app.route('/dancescoring/rec', methods=['GET', 'POST'])
def menu1_rec():
    video_file = request.args.get('video', '')
    video_file = video_file.split('.')[0] + '.mp4'
    return render_template('dance_rec.html', video_file=video_file)


# 비디오 스트리밍 경로 처리
@app.route('/dancescoring/rec/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# 녹화 시작 및 정지 경로 처리
@app.route('/dancescoring/rec/toggle_record')
def toggle_record():
    global recording, frames, video_capture
    recording = not recording
    return {'status': 'success', 'recording': recording}

# 다운로드 경로 처리
@app.route('/dancescoring/rec/download_video')
def download_video():
    global frames

    # 파일 이름은 현재 시간으로 설정
    filename = f"recorded_video_{datetime.now().strftime('%Y%m%d%H%M%S')}.mp4"
    file_path = os.path.join(os.getcwd(), filename)

    # 프레임들을 비디오로 저장
    height, width, layers = cv2.imdecode(np.frombuffer(frames[0], dtype=np.uint8), cv2.IMREAD_UNCHANGED).shape
    video_writer = cv2.VideoWriter(file_path, cv2.VideoWriter_fourcc(*'XVID'), 10, (width, height))

    for frame in frames:
        video_writer.write(cv2.imdecode(np.frombuffer(frame, dtype=np.uint8), cv2.IMREAD_UNCHANGED))

    video_writer.release()
    
    # 녹화 중이 아닐 때만 웹캠 꺼지도록
    video_capture.release()

    return send_file(file_path, as_attachment=True)


# 모션 딥페이크
@app.route('/motiondeepfacke')
def menu2():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)