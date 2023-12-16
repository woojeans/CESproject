const images = ['bg-home.png', 'bg-home2.png', 'bg-home3.png', 'bg-home4.png']; // 이미지 경로 배열
const header = document.querySelector('.bg-home');
let currentImageIndex = 0;

function changeBackgroundImage() {
  header.style.backgroundImage = `url('../static/assets/img/${images[currentImageIndex]}')`;
  currentImageIndex = (currentImageIndex + 1) % images.length; // 다음 이미지로 이동

  setTimeout(changeBackgroundImage, 3000); // 3초마다 실행
}

changeBackgroundImage(); // 이미지 변경 시작