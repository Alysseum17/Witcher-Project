import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

function divideCharacterInfo(result) {
  function splitMultilineString(str) {
    if (!str) return [];
    return str
      .replace(/<br\s*\/?>/gi, ', ')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  function splitAbilities(str) {
    if (!str) return [];
    return str
      .replace(/<br\s*\/?>/gi, ',')
      .split(/,|(?=[A-Z][a-z])/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const sections = {
    basic: [
      'title',
      'aka',
      'born',
      'race',
      'gender',
      'titles',
      'profession',
      'affiliations',
    ],
    appearance: ['hair_color', 'eye_color', 'skin_color'],
    relationships: ['parents', 'partner', 'children'],
    abilities: ['abilities'],
    description: ['description'],
    images: ['images'],
    other: [],
  };

  const divided = {
    basic: {},
    appearance: {},
    relationships: {},
    abilities: [],
    description: '',
    images: [],
    other: {},
  };
  for (const [key, value] of Object.entries(result)) {
    let found = false;
    for (const section in sections) {
      if (sections[section].includes(key)) {
        if (section === 'description') {
          divided.description = value;
        } else if (section === 'images') {
          let index;
          if (value[0].indexOf('.png') > -1 && value[0].indexOf('.jpg') > -1) {
            index = Math.max(
              value[0].indexOf('.png'),
              value[0].indexOf('.jpg'),
            );
          } else if (value[0].indexOf('.png') === -1) {
            index = value[0].indexOf('.jpg');
          } else if (value[0].indexOf('.jpg') === -1) {
            index = value[0].indexOf('.png');
          }
          const srcImage = value[0].slice(0, index + 4);
          divided.images.push(srcImage);
        } else if (key === 'aka' || key === 'abilities') {
          if (key === 'aka')
            divided.basic.aka = splitMultilineString(value).join(', ');
          if (key === 'abilities')
            divided.abilities = splitAbilities(value).join(', ');
        } else {
          divided[section][key] = splitMultilineString(value).join(', ');
        }
        found = true;
        break;
      }
    }
    if (!found) divided.other[key] = value;
  }

  // if (!divided.description && result.html) {
  //   try {
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(result.html, 'text/html');
  //     const paragraphs = doc.querySelectorAll('.mw-parser-output > p');
  //     const firstThree = Array.from(paragraphs).slice(0, 3);
  //     const text = firstThree
  //       .map((p) => p.textContent.trim())
  //       .join(' ')
  //       .trim();
  //     if (text) divided.description = text;
  //   } catch (e) {
  //     console.warn('Не вдалося обробити HTML для опису:', e);
  //   }
  // }

  return divided;
}

const upperCase = (str) => {
  if (!str) return '';
  if (str.includes(' ')) {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    return str;
  }
};

export const createHTML = async (req, rep) => {
  const character = req.body.title || req.body.character;
  const result = await searchCharacter(upperCase(character));
  if (!result.description) {
    rep.type('text/html').send(
      `<div class="search--result">
          <article class="bestiary-empty">
    <div class="empty-icon">
      <ion-icon name="skull-outline"></ion-icon>
    </div>

    ${
      result.title === 'Home'
        ? `<h2 class="empty-title">The search field is empty</h2>
          <p class="empty-text"> Please enter the character name </p>`
        : `<h2 class="empty-title">No tracks on the Path</h2>
            <p class="empty-text">
            We couldn't find <strong>“${result.title}”</strong> in the bestiary. 
            </p>
          <ul class="empty-hints">
          <li>Check the spelling — even the sharpest Witcher can slip.</li>
          <li>Try a shorter name or just one keyword.</li>
          <li>Browse <em>Popular Searches</em> on the right.</li>
          </ul>`
    }
    
  </article>
        </div>`,
    );
    return;
  }
  const divided = divideCharacterInfo(result);
  const html = `
  <div class="search--result">
<article class="bestiary-entry">
  <div class="entry-left">
    <img
      src="${divided.images[0] || 'placeholder.webp'}"
      alt="${divided.basic.title || 'Unknown'}"
      class="entry-img"
    />
  </div>

  <div class="entry-right">
    <h2 class="entry-title">${divided.basic.title || 'Unknown'}</h2>

    <div class="entry-grid">
      <section>
        <h3>Basic</h3>
        <dl>
          <div><dt>Alias(es)</dt><dd>${divided.basic.aka || 'Unknown'}</dd></div>
          <div><dt>Born</dt>     <dd>${divided.basic.born || 'Unknown'}</dd></div>
        </dl>
      </section>

      <section>
        <h3>Physical</h3>
        <dl>
          <div><dt>Hair</dt> <dd>${divided.appearance.hair_color || 'Unknown'}</dd></div>
          <div><dt>Eyes</dt> <dd>${divided.appearance.eye_color || 'Unknown'}</dd></div>
          <div><dt>Skin</dt> <dd>${divided.appearance.skin_color || 'Unknown'}</dd></div>
          <div><dt>Race</dt>     <dd>${divided.basic.race || 'Unknown'}</dd></div>
          <div><dt>Gender</dt>   <dd>${divided.basic.gender || 'Unknown'}</dd></div>
        </dl>
      </section>

      <section>
        <h3>Personal</h3>
        <dl>
          <div><dt>Profession</dt>  <dd>${divided.basic.profession || 'Unknown'}</dd></div>
          <div><dt>Affiliation</dt> <dd>${divided.basic.affiliations || 'Unknown'}</dd></div>
          <div><dt>Abilities</dt>   <dd>${divided.abilities || 'Unknown'}</dd></div>
        </dl>
      </section>

      <section>
        <h3>Family</h3>
        <dl>
          <div><dt>Parent(s)</dt>  <dd>${divided.relationships.parents || 'Unknown'}</dd></div>
          <div><dt>Partner(s)</dt> <dd>${divided.relationships.partner || 'Unknown'}</dd></div>
          <div><dt>Children</dt>   <dd>${divided.relationships.children || 'Unknown'}</dd></div>
        </dl>
      </section>
    </div>
    <div class="entry-description">
      ${divided.description
        .map((p) => {
          if (p === 'TBA') {
            return '<p>No Info</p>';
          }
          if (p.length > 40) {
            return `<p>${p}</p>`;
          } else {
            return `<h3>${p}</h3>`;
          }
        })
        .join('')}
    </div>
  </div>
</article>
</div>
  `;
  rep.type('text/html').send(html);
};

const searchCharacter = async (title) => {
  const url = `https://witcher.fandom.com/wiki/${encodeURIComponent(title)}`;
  try {
    const res = await fetch(url);
    const data = await res.text();
    return await parseHTML(data);
  } catch (error) {
    console.log(error);
    return null;
  }
};

const parseHTML = async (html) => {
  if (!html) return null;

  const doc = new JSDOM(html).window.document;

  const title =
    doc.querySelector('.page-header__title')?.textContent.trim() ||
    doc
      .querySelector('title')
      ?.textContent.replace(' | Witcher Wiki | Fandom', '')
      .trim() ||
    '';

  const images = [];
  const infoboxImg = doc.querySelector('.pi-image img');
  if (infoboxImg && infoboxImg.src) images.push(infoboxImg.src);

  const result = { title, images };

  doc.querySelectorAll('.pi-item.pi-data').forEach((row) => {
    const key =
      row.dataset.source ||
      row
        .querySelector('.pi-data-label')
        ?.textContent.trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

    const valueNode = row.querySelector('.pi-data-value');
    let value = valueNode?.textContent.replace(/\[[^\]]*]/g, '').trim();

    if (key && value) {
      if (key === 'aka') {
        let raw = valueNode?.innerHTML || '';
        result[key] =
          raw
            .split(/<br\s*\/?>|;|,/gi)
            .map((s) =>
              s
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/\[[^\]]*]/g, '')
                .trim(),
            )
            .filter(Boolean)
            .join(', ') || value;
      } else {
        result[key] = value;
      }
    }
  });

  const paragraphs = [
    ...doc.querySelectorAll('.mw-headline, .mw-parser-output > p'),
  ].map((h2) => h2.textContent.trim());
  result.description = paragraphs;
  // console.log(
  //   [...doc.querySelectorAll('.mw-headline, .mw-parser-output > p')].map((h2) =>
  //     h2.textContent.trim(),
  //   ),
  // );
  // result.description = paragraphs.map((p) =>
  //   p.textContent
  //     .replace(/\s+/g, ' ')
  //     .replace(/\[[^\]]*]/g, '')
  //     .trim(),
  // );
  // const firstFour = paragraphs.slice(0, 4);
  // if (firstFour.length) {
  //   result.description = firstFour.map((p) =>
  //     p.textContent
  //       .replace(/\s+/g, ' ')
  //       .replace(/\[[^\]]*]/g, '')
  //       .trim(),
  //   );
  // }

  return result;
};
