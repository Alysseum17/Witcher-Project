'use strict';
const searchBtn = document.querySelector('.search--button');


searchBtn.addEventListener('click', function () {
  const searchingName = document.querySelector('.search--input').value
  if (!searchingName) return;
  console.log(`${document.querySelector('.search--input').value}`);
  document.querySelector('.search--input').value = '';
})