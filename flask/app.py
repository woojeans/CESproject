from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO
import os
import cv2
import base64
import numpy as np

import mediapipe as mp
from moviepy.editor import *
from scipy.spatial import distance
from sklearn.preprocessing import MinMaxScaler

user_landmark = None
# 포즈 검출 함수
def detectPose(image_pose, draw=False):
    mp_pose = mp.solutions.pose
    pose_video = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.7,
                            min_tracking_confidence=0.7)
    mp_drawing = mp.solutions.drawing_utils
    
    original_image = image_pose.copy()
    image_in_RGB = cv2.cvtColor(image_pose, cv2.COLOR_BGR2RGB)
    resultant = pose_video.process(image_in_RGB)

    if resultant.pose_landmarks and draw:    

        mp_drawing.draw_landmarks(image=original_image, landmark_list=resultant.pose_landmarks,
                                  connections=mp_pose.POSE_CONNECTIONS,
                                  landmark_drawing_spec=mp_drawing.DrawingSpec(color=(255,255,255),
                                                                               thickness=3, circle_radius=3),
                                  connection_drawing_spec=mp_drawing.DrawingSpec(color=(49,125,237),
                                                                               thickness=2, circle_radius=2))
    return original_image, resultant


def dist_sim_part(target, user):
    if target.pose_world_landmarks != None and user != None:
        # 좌표값 추출
        target_landmarks = target.pose_world_landmarks.landmark
        target_lm = np.array([[i.x, i.y, i.z] for i in target_landmarks])
        # target_lm = target_lm[part, :]
        
        user_landmarks = user.pose_world_landmarks.landmark
        user_lm = np.array([[i.x, i.y, i.z] for i in user_landmarks])
        # user_lm = user_lm[part, :]

        # 정규화
        scaler = MinMaxScaler()
        target_norm = scaler.fit_transform(target_lm)
        user_norm = scaler.fit_transform(user_lm)
        
        # 거리 구하기
        dis_x = distance.euclidean(target_norm[:, 0], user_norm[:, 0])
        dis_y = distance.euclidean(target_norm[:, 1], user_norm[:, 1])
        dis_z = distance.euclidean(target_norm[:, 2], user_norm[:, 2])
        
        # sim
        similarity = 1/(1+np.mean([dis_x, dis_y, dis_z]))
        
        return round(similarity * 100, 2)
    else:
        return 0

app = Flask(__name__)
socketio = SocketIO(app)
app.secret_key = 'Uni4'

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
    # selectedCameraIndex = request.args.get('selectedCameraIndex', default=0)
    video_file = request.args.get('video', '')
    video_file = video_file.split('.')[0] + '.mp4'

    session['video_file'] = video_file
    return render_template('dance_rec.html', video_file=video_file)

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('frame')
def handle_frame(frame):
    global user_landmark

    # 디코드
    frame_data = frame.split(',')[1]
    image_data = base64.b64decode(frame_data)
    nparr = np.fromstring(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 좌우 반전 처리
    img_flipped = cv2.flip(img, 1)
    det_img, user_landmark = detectPose(img_flipped, True)

    # 다시 데이터 URI로 변환
    _, img_encoded = cv2.imencode('.jpg', det_img)
    frame_flipped = "data:image/jpeg;base64," + base64.b64encode(img_encoded).decode('utf-8')

    socketio.emit('frame', frame_flipped)

@app.route('/update_time', methods=['POST'])
def update_time():
    data = request.get_json()
    current_time = data.get('currentTime')

    video_file = session.get('video_file')
    # user_landmark = session.get('user_landmark')
    global user_landmark
    target_video = VideoFileClip('./static/dance/'+video_file)
    img = target_video.get_frame(current_time)

    _, target_landmark = detectPose(img, False)
    score = dist_sim_part(target_landmark, user_landmark)

    socketio.emit('score', {'score': score})

    return jsonify({'message': 'Time updated successfully'})

if __name__ == '__main__':
    socketio.run(app, debug=True)