const button = document.querySelector('#link')!;
button.addEventListener('click', () => {
  window.open(
    'https://discord.com/api/oauth2/authorize?client_id=284432080069459971&permissions=294205483072&scope=applications.commands%20bot',
    '_blank'
  );
});

let slideIndex = 0;

const carousel = () => {
  const x = document.getElementsByClassName('liveSlide');
  const y = document.getElementsByClassName('trackSlide');
  const z = document.getElementsByClassName('opSlide');
  if (x.length === y.length && x.length === z.length) {
    for (let i = 0; i < x.length; i += 1) {
      x[i].classList.add('hidden');
      y[i].classList.add('hidden');
      z[i].classList.add('hidden');
    }
    slideIndex += 1;
    if (slideIndex > x.length) {
      slideIndex = 1;
    }
    x[slideIndex - 1].classList.remove('hidden');
    y[slideIndex - 1].classList.remove('hidden');
    z[slideIndex - 1].classList.remove('hidden');
    setTimeout(carousel, 5000); // Change image every 2 seconds
  }
};

carousel();

const audio = new Audio('public/hoshi_comet.mp3');
const musicPlayer = document.querySelector('nav > img');
musicPlayer?.addEventListener('click', () => {
  if (audio.paused) {
    audio.currentTime = 0;
    audio.play();
    audio.volume = 0.125;
    return;
  }
  if (!audio.paused) audio.pause();
});
