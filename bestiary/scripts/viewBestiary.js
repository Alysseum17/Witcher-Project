'use strict';

const searchBtn = document.querySelector('.search--button');
const serachingArea = document.querySelector('.popular--searches');

searchBtn.addEventListener('click', function () {
  const searchingName = document.querySelector('.search--input').value
  if (!searchingName) return;
  window.location.href = 'result.html';
  document.querySelector('.search--input').value = '';
})

serachingArea.addEventListener('click', function(e) {
  let targetEl;
  if (e.target.closest('.popular--card')) targetEl = e.target.closest('.popular--card');
  else return;
  window.location.href = 'result.html';
})