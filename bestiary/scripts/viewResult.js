'use strict';

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

document.body.addEventListener('htmx:afterSwap', function () {
  document.querySelector('.search--input').value = '';
  document.querySelector('.search--input').blur();
});
