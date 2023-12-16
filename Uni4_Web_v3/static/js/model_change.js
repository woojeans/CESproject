function changeModel(modelName, element) {
    // 토글 버튼
    const buttons = document.querySelectorAll('.model-btn');
    
    buttons.forEach(button => {
        if (button === element) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // 모델 이미지 바꾸기
    var imgModel = document.querySelector('.img-model');
    imgModel.style.transition = 'background-image 0.5s ease-in-out';

    change_img = `url('../static/assets/img/model_${modelName}.png')`;
    imgModel.style.backgroundImage = change_img;

    // 트랜지션 효과를 적용하고 나서 삭제
    setTimeout(() => {
        imgModel.style.transition = '';
    }, 600);

    // 버튼 이미지 바꾸기
    const btn_img = document.querySelectorAll('.cloth-img');

    for (let i = 1; i <= 3; i++) {
        btn_img[i - 1].src = `../static/assets/img/cloth_${modelName}${i}.jpg`;
    }
}