'use strict';

const searchBtn = document.querySelector('.search--button');

const basDesc = ['Basic Information: Alias(es)^ White Wolf; Gwynbleidd; White One; Butcher of Blaviken; Ravix of Fourhorn; Geralt Roger Eric du Haute-Bellegarde (the first name he wanted) Born 1211[1] (see #Age) Coat of arms'
  ,"Physical Information: Hair color Milk-white Eye color Dark, unspecified color (books); Green (comics, The Hexer); Golden (games,[N 1] Netflix's The Witcher) Skin Pale Race Human (witcher) Gender Male"
  ,'Personal Information: Title(s) Knight (knighted by Meve) Profession Witcher Affiliation(s) Wolf School Abilities Superhuman abilities; Swordsmanship; Alchemy; Signs','Family: Parent(s) Visenna (mother); Korin (father) Partner(s) Yennefer (love of his life in books, possible lover in The Witcher 3: Wild Hunt); Triss Merigold (former lover in books, possible lover in all three games) Child(ren) Ciri (adopted daughter)'
  ,"Appearance(s): Voice actor Doug Cockle (English); Jacek Rozenek (Polish) Actor Michał Żebrowski (The Hexer); Henry Cavill (Netflix's The Witcher; season 1-3); Liam Hemsworth (Netflix's The Witcher; season 4-) Books see Appearances section"
  ];
const image = "https://static.wikia.nocookie.net/witcher/i…t/scale-to-width-down/268?cb=20191228182240";
const description = ["Geralt of Rivia was a legendary witcher of the School of the Wolf active throughout the 13th century. He loved the sorceress Yennefer, considered the love of his life despite their tumultuous relationship, and became Ciri's adoptive father.","Despite his name, Geralt does not come from Rivia. He received his training as a witcher in Kaer Morhen, which is located in Kaedwen. He added 'of Rivia' to his name as he began work as a witcher, under advice from Vesemir that folk would be more trusting of him if he had a surname."
,"After completing his witcher training, he received his Wolf medallion and embarked into the world on his horse called Płotka to become a monster slayer for hire."];



const createHTML = function (charName, fullDesc, mainImage, basicDesc) {

  document.querySelector('.search').insertAdjacentHTML('beforeend',
    `<div class="search--result grid">
         <div class="search--card flex--container">
            <img src="${mainImage}" alt="Geralt" class="img--search" /><h3
              href="#"
              class="search--name"
              >${charName}</h3
            >
          </div>
          <div class="search--info">
          <div class="short--description grid grid--4-cols">
            <div class="short--info">
              <h2 class="short--heading"></h2>
              <div class="short--part">
              <h3 class="short--name">Alias(es)</h3>
              <p class="short--text">
                White Wolf
                Gwynbleidd
                White One
                Butcher of Blaviken
                Ravix of Fourhorn
                Geralt Roger Eric du Haute-Bellegarde (the first name he wanted)</p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Born</h3>
                <p class="short--text">
                  1211</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Coat of arms</h3>
                  <p class="short--text">
                    Img
                  </p>
                  </div>
            </div>
            <div class="short--info">
              <h2 class="short--heading">Basic Information</h2>
              <div class="short--part">
              <h3 class="short--name">Alias(es)</h3>
              <p class="short--text">
                White Wolf
                Gwynbleidd
                White One
                Butcher of Blaviken
                Ravix of Fourhorn
                Geralt Roger Eric du Haute-Bellegarde (the first name he wanted)</p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Born</h3>
                <p class="short--text">
                  1211</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Coat of arms</h3>
                  <p class="short--text">
                    Img
                  </p>
                  </div>
            </div>
            <div class="short--info">
              <h2 class="short--heading">Basic Information</h2>
              <div class="short--part">
              <h3 class="short--name">Alias(es)</h3>
              <p class="short--text">
                White Wolf
                Gwynbleidd
                White One
                Butcher of Blaviken
                Ravix of Fourhorn
                Geralt Roger Eric du Haute-Bellegarde (the first name he wanted)</p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Born</h3>
                <p class="short--text">
                  1211</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Coat of arms</h3>
                  <p class="short--text">
                    Img
                  </p>
                  </div>
            </div>
            <div class="short--info">
              <h2 class="short--heading">Basic Information</h2>
              <div class="short--part">
              <h3 class="short--name">Alias(es)</h3>
              <p class="short--text">
                White Wolf
                Gwynbleidd
                White One
                Butcher of Blaviken
                Ravix of Fourhorn
                Geralt Roger Eric du Haute-Bellegarde (the first name he wanted)</p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Born</h3>
                <p class="short--text">
                  1211</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Coat of arms</h3>
                  <p class="short--text">
                    Img
                  </p>
                  </div>
            </div>
          </div>
          <div class="description">
            <p class="description--text">
              ${fullDesc[0]}
              </p>
              <p class="description--text">
              ${fullDesc[1]}
            </p>
            <p class="description--text">
              ${fullDesc[2]}
              </p>
          </div>
      </div>`);
}

createHTML('Geralt', description, 'images/questionMark.png', basDesc)

searchBtn.addEventListener('click', function (e) {
  const searchingName = document.querySelector('.search--input').value
  if (!searchingName) return;
  console.log(`${document.querySelector('.search--input').value}`);
  document.querySelector('.search--input').value = '';
})


// htmx