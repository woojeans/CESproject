function changeModelImage(clickedImage) {
    var imageName = clickedImage.src.split('/').pop().split('_')[1].split('.')[0];
    console.log(imageName)

    var imgModel = document.querySelector('.img-model');
    imgModel.style.transition = 'background-image 0.5s ease-in-out';
    
    change_img = `url('../static/assets/img/${imageName}.png')`;
    imgModel.style.backgroundImage = change_img;

    // 트랜지션 효과를 적용하고 나서 삭제
    setTimeout(() => {
        imgModel.style.transition = '';
    }, 600);
}
