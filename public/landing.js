var cards = document.querySelectorAll('.card');
var options = {
    root: null,
    threshold: 0,
    rootMargin: '-200px 1500px -200px 1500px'
};

//Seconde Section
const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }
        entry.target.classList.add('appear');
    });
}, options);

cards.forEach((card) => {
    observer.observe(card);
});

//Section 3(Typewritter effect)
var isScrolling = true;
$(document).scroll(function() {
    if (scrollY > 800 && isScrolling) {
        init();
        isScrolling = false;
    }
});

const TypeWriter = function(txtElement, words) {
    this.txtElement = txtElement;
    this.words = words;
    this.txt = '';
    this.wordIndex = 0;
    this.type();
};

TypeWriter.prototype.type = function() {
    const current = this.wordIndex;
    const fulltxt = this.words[current];
    this.txt = fulltxt.substring(0, this.txt.length + 1);

    this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;
    let typeSpeed = 100;

    setTimeout(() => this.type(), typeSpeed);
};

//declare a typewriter
// document.addEventListener('DOMContentLoaded', init);

function init() {
    const txtElement = document.querySelector('.txt-type');
    const words = [
        'Hotel Hunts Blogs is an exclusive extension to our main Site Hotel Hunts.This extension provides you with an platform to share your hotel stay expriences with other people.Everytime you write a blog about your latest hotel experience, we link your blog to the corresponding hotel and other users can easily access it from the hotel display page itself.'
    ];

    new TypeWriter(txtElement, words);
}