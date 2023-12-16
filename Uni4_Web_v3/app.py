import os

from flask import Flask, render_template, request, session
app = Flask(__name__)
app.secret_key = 'Uni4'


# 홈
@app.route('/')
def index():
    return render_template('home.html')

# 춤채점
@app.route('/dance_scoring')
def dance_scoring():
    video_dir = './static/assets/dance/album'
    video_cover = os.listdir(video_dir)
    return render_template('dance_scoring.html', video_cover=video_cover)

@app.route('/dance_scoring/rec', methods=['GET', 'POST'])
def dance_scoring_rec():
    album_file = request.args.get('video', '')
    video_file = album_file.split('.')[0] + '.mp4'
    session['video_file'] = video_file
    return render_template('dance_scoring_rec.html', video_file=video_file, album_file = album_file)

# 의상 체인지
@app.route('/cloth_change')
def cloth_change():
    return render_template('cloth_change.html')

# 모션딥페이크
@app.route('/motion_deepfake')
def motion_deepfake():
    return render_template('motion_deepfake.html')

@app.route('/motion_deepfake/result')
def motion_deepfake_result():
    return render_template('motion_deepfake_result.html')