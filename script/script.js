'use strict';

const smoothScroll = () => {
  const heroSection = document.querySelector('.section--hero');
  const links = document.querySelectorAll('a:link');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
      if (href !== '#' && href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        const elSibling = el.previousElementSibling;
        console.log(
          window.getComputedStyle(elSibling).getPropertyValue('padding-bottom'),
        );
        const rect = elSibling.getBoundingClientRect();
        const absoluteElementTop = rect.bottom + window.pageYOffset;
        window.scrollTo({
          top:
            absoluteElementTop -
            parseInt(
              window
                .getComputedStyle(elSibling)
                .getPropertyValue('padding-bottom'),
            ) +
            30, // Magic number
          behavior: 'smooth',
        });
      }
    });
  });
  const obs = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (!entry.isIntersecting) document.body.classList.add('sticky');
      if (entry.isIntersecting) document.body.classList.remove('sticky');
    },
    {
      root: null,
      threshold: 0,
      rootMargin: '-96px',
    },
  );
  obs.observe(heroSection);
};
const showModal = () => {
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('modal');
  const close = document.getElementById('close');

  function openModal(mode) {
    document.getElementById(mode + '-tab').checked = true;
    overlay.classList.add('active');
    modal.classList.add('active');
  }
  function closeModal() {
    overlay.classList.remove('active');
    modal.classList.remove('active');
  }

  document
    .querySelector('.btn--signup')
    .addEventListener('click', () => openModal('signup'));
  document
    .querySelector('.btn--login')
    .addEventListener('click', () => openModal('login'));

  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
};

const init = () => {
  smoothScroll();
  showModal();
};
init();
