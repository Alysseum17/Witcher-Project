'use strict';
const searchBtn = document.querySelector('.search--button');

searchBtn.addEventListener('click', function () {
  // e.preventDefault();
  const searchingName = document.querySelector('.search--input').value;
  if (!searchingName) return;
  // document.querySelector('.search--input').value = '';
});
