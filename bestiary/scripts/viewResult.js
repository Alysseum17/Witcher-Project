'use strict';
const searchBtn = document.querySelector('.search--button');

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const character = params.get('character');
  if (character) {
    const resultDiv = document.querySelector('.search--result');
    resultDiv.setAttribute('hx-post', 'http://localhost:3000/api/v1/bestiary');
    resultDiv.setAttribute('hx-trigger', 'load');
    resultDiv.setAttribute('hx-vals', JSON.stringify({ character }));
    resultDiv.setAttribute('hx-swap', 'outerHTML');
    htmx.process(resultDiv);
  }
});

if (searchBtn) {
  searchBtn.addEventListener('click', function () {
    const searchingName = document.querySelector('.search--input').value;
    if (!searchingName) return;
    // document.querySelector('.search--input').value = '';
  });
}
