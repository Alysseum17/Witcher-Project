'use strict';

const searchForm = document.getElementById('search--form');
const serachingArea = document.querySelector('.popular--searches');

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const character = document.querySelector('#character--input').value;
  if (character) {
    // Redirect to result.html with character as a query param
    window.location.href = `result.html?character=${encodeURIComponent(character)}`;
  }
});

serachingArea.addEventListener('click', function (e) {
  if (!e.target.closest('.popular--card')) return;
  const character = e.target.closest('.popular--card').dataset.name;
  window.location.href = `result.html?character=${encodeURIComponent(character)}`;
});
