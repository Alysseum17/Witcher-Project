"use strict";

const links = document.querySelectorAll("a:link");
links.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");

    if (href === "#") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (href !== "#" && href.startsWith("#")) {
      e.preventDefault();
      const targetElement = document.querySelector(href);
      const previousElement = targetElement.previousElementSibling;

      if (previousElement) {
        const rect = previousElement.getBoundingClientRect();
        const scrollPosition =
          rect.bottom +
          window.pageYOffset -
          parseInt(
            window
              .getComputedStyle(previousElement)
              .getPropertyValue("padding-bottom")
          ) +
          30;

        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
      }
    }
  });
});

const heroSection = document.querySelector(".section--hero");
const headerObserver = new IntersectionObserver(
  (entries) => {
    const [entry] = entries;
    entry.isIntersecting
      ? document.body.classList.remove("sticky")
      : document.body.classList.add("sticky");
  },
  {
    root: null,
    threshold: 0,
    rootMargin: "-96px",
  }
);
if (heroSection) headerObserver.observe(heroSection);

const easyQuizButton = document.getElementById("easyQuiz");
if (easyQuizButton) {
  easyQuizButton.addEventListener("click", function () {
    window.open("./quiz/easy-quiz.html", "_blank");
  });
}

const mediumQuizButton = document.getElementById("mediumQuiz");
if (mediumQuizButton) {
  mediumQuizButton.addEventListener("click", function () {
    window.open("./quiz/medium-quiz.html", "_blank");
  });
}

const hardQuizButton = document.getElementById("hardQuiz");
if (hardQuizButton) {
  hardQuizButton.addEventListener("click", function () {
    window.open("./quiz/hard-quiz.html", "_blank");
  });
}