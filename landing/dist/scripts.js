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
