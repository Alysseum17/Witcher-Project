'use strict';
// const btnInfo = document.querySelector(".button--info");
// const howSection = document.querySelector(".how--section");
const heroSection = document.querySelector('.section--hero');
// btnInfo.addEventListener("click", (e) => {
//   e.preventDefault();
//   howSection.scrollIntoView({ behavior: "smooth" });
// });
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
      // Calculate the absolute position relative to the document
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
    console.log(entry);
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
