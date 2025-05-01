const slider = () => {
  const slides = document.querySelectorAll('.slide');
  const previousBtn = document.querySelector('.left--button');
  const nextBtn = document.querySelector('.right--button');
  const dotsContainer = document.querySelector('.dots--container');
  let currentSlide = 0;
  const createDots = () => {
    slides.forEach((_, index) => {
      dotsContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dot" data-slide="${index}"></button>`,
      );
    });
  };
  const activateDot = (slide) => {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((el) => {
      el.classList.remove('dot--active');
    });
    const currentDot = document.querySelector(`.dot[data-slide="${slide}"`);
    currentDot.classList.add('dot--active');
  };
  const goToSLide = (slide) => {
    slides.forEach(
      (el, index) =>
        (el.style.transform = `translateX(${100 * (index - slide)}%)`),
    );
  };
  const nextSlide = () => {
    if (currentSlide === slides.length - 1) currentSlide = 0;
    else currentSlide++;
    goToSLide(currentSlide);
    activateDot(currentSlide);
  };
  const previousSlide = () => {
    if (currentSlide === 0) currentSlide = slides.length - 1;
    else currentSlide--;
    goToSLide(currentSlide);
    activateDot(currentSlide);
  };
  nextBtn.addEventListener('click', nextSlide);
  previousBtn.addEventListener('click', previousSlide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') previousSlide();
  });
  dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('dot')) {
      currentSlide = e.target.dataset.slide;
      goToSLide(currentSlide);
      activateDot(currentSlide);
    }
  });
  const init = () => {
    createDots();
    goToSLide(0);
    activateDot(0);
  };
  init();
};
slider();
