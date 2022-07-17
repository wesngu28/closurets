var button = document.querySelector('#link');
button.addEventListener('click', function () {
    window.open('https://discord.com/api/oauth2/authorize?client_id=284432080069459971&permissions=294205483072&scope=applications.commands%20bot', '_blank');
});
var slideIndex = 0;
var carousel = function () {
    var x = document.getElementsByClassName('liveSlide');
    var y = document.getElementsByClassName('trackSlide');
    var z = document.getElementsByClassName('opSlide');
    if (x.length === y.length && x.length === z.length) {
        for (var i = 0; i < x.length; i += 1) {
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
var audio = new Audio('public/hoshi_comet.mp3');
var musicPlayer = document.querySelector('nav > img');
musicPlayer === null || musicPlayer === void 0 ? void 0 : musicPlayer.addEventListener('click', function () {
    if (audio.paused) {
        audio.currentTime = 0;
        audio.play();
        audio.volume = 0.125;
        return;
    }
    if (!audio.paused)
        audio.pause();
});
