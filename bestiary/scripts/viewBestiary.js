'use strict';

const searchBtn = document.querySelector('.search--button');
const serachingArea = document.querySelector('.popular--searches');

searchBtn.addEventListener('click', function () {
  const searchingName = document.querySelector('.search--input').value;
  if (!searchingName) return;
  window.location.href = `result.html?character=${encodeURIComponent(searchingName)}`;
});

serachingArea.addEventListener('click', function (e) {
  if (!e.target.closest('.popular--card')) return;
  window.location.href = 'result.html';
});
