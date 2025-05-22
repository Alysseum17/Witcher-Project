import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

export default async function (fastify, _opts) {
  fastify.post('/bestiary', createHTML);
}

function divideCharacterInfo(result) {
  function splitMultilineString(str) {
    if (!str) return [];
    return str
      .replace(/<br\s*\/?>/gi, '\n')
      .split(/\n|;|,|\r|\t/)
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
    abilities: {},
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
          divided.images = Array.isArray(value)
            ? value.slice(0, 1)
            : value
              ? [value]
              : [];
        } else if (key === 'aka' || key === 'abilities') {
          const items = splitMultilineString(value);
          if (key === 'aka') divided.basic.aka = items;
          if (key === 'abilities') divided.abilities = items;
        } else {
          divided[section][key] = value;
        }
        found = true;
        break;
      }
    }
    if (!found) divided.other[key] = value;
  }

  if (!divided.description && result.html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.html, 'text/html');
      const paragraphs = doc.querySelectorAll('.mw-parser-output > p');
      const firstThree = Array.from(paragraphs).slice(0, 3);
      const text = firstThree
        .map((p) => p.textContent.trim())
        .join(' ')
        .trim();
      if (text) divided.description = text;
    } catch (e) {
      console.warn('Не вдалося обробити HTML для опису:', e);
    }
  }

  return divided;
}

const createHTML = async (req, rep) => {
  const character = req.body.title || req.body.character;
  const result = await searchCharacter(character);

  if (!result) {
    rep.type('text/html').send(
      `<div class="search--result grid">
          <div class="search--card flex--container">
            <img src="../../bestiary/images/questionMark.png" alt="Unknown" class="img--search" /><h3
              href="#"
              class="search--name"
              >${character || 'Unknown'}</h3
            >
          </div>
        </div>`,
    );
    return;
  }
  const divided = divideCharacterInfo(result);
  const html = `
    <div class="search--result grid">
         <div class="search--card flex--container">
            <img src="../../images/geralt.webp" alt="Geralt" class="img--search" /><h3
              href="#"
              class="search--name"
              >${divided.basic.title ?? 'Unknown'}</h3
            >
          </div>
          <div class="search--info">
          <div class="short--description grid grid--4-cols">
            <div class="short--info">
              <h2 class="short--heading">Basic Information:</h2>
              <div class="short--part">
              <h3 class="short--name">Alias(es)</h3>
              <p class="short--text">
               ${divided?.basic?.aka ?? 'Unknown'} 
              </p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Born</h3>
                <p class="short--text">
                  ${divided?.basic?.born ?? 'Unknown'}</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Coat of arms</h3>
                  <p class="short--text">
                    Img
                  </p>
                  </div>
            </div>
            <div class="short--info">
              <h2 class="short--heading">Physical Information:</h2>
              <div class="short--part">
                <h3 class="short--name">Hair color</h3>
              <p class="short--text">
                ${divided?.appearance?.hair_color ?? 'Unknown'}</p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Eye color</h3>
                <p class="short--text">
                  ${divided?.appearance?.eye_color ?? 'Unknown'}</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Skin</h3>
                  <p class="short--text">
                    ${divided?.appearance?.skin_color ?? 'Unknown'}
                  </p>
                  </div>
                  <div class="short--part">
                  <h3 class="short--name">Race</h3>
                  <p class="short--text">
                    ${divided?.basic?.race ?? 'Unknown'}
                  </p>
                  </div>
                  <div class="short--part">
                  <h3 class="short--name">Gender</h3>
                  <p class="short--text">
                    ${divided?.basic?.gender ?? 'Unknown'}
                  </p>
                  </div>
            </div>
            <div class="short--info">
              <h2 class="short--heading">Personal Information:</h2>
              <div class="short--part">
              <h3 class="short--name">Profession</h3>
              <p class="short--text">
                ${divided?.basic?.profession ?? 'Unknown'}</p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Affiliation(s)</h3>
                <p class="short--text">
                  ${divided?.basic?.affiliations ?? 'Unknown'}</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Abilities</h3>
                  <p class="short--text">
                    ${divided?.abilities[0] ?? 'Unknown'}
                  </p>
                  </div>
            </div>
            <div class="short--info">
              <h2 class="short--heading">Family:</h2>
              <div class="short--part">
              <h3 class="short--name">Parent(s)</h3>
              <p class="short--text">
                ${divided?.relationships?.parents ?? 'Unknown'}</p>
              </div>
              <div class="short--part">
                <h3 class="short--name">Partner(s)</h3>
                <p class="short--text">
                  ${divided?.relationships?.partner ?? 'Unknown'}</p>
                </div>
                <div class="short--part">
                  <h3 class="short--name">Child(ren)</h3>
                  <p class="short--text">
                    ${divided?.relationships?.children ?? 'Unknown'}
                  </p>
                  </div>
            </div>
            </div>
            </div>
            <div class="description">
              <p class="description--text">
                ${divided?.description[0] ?? 'Unknown'}
              </p>
              <p class="description--text">
                ${divided?.description[1] ?? ''}
              </p>
              <p class="description--text">
                ${divided?.description[2] ?? ''}
              </p>
          </div>
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

  const paragraphs = [...doc.querySelectorAll('.mw-parser-output > p')].filter(
    (p) => p.textContent.trim().length > 30,
  );

  const firstThree = paragraphs.slice(0, 3);
  if (firstThree.length) {
    result.description = firstThree.map((p) =>
      p.textContent
        .replace(/\s+/g, ' ')
        .replace(/\[[^\]]*]/g, '')
        .trim(),
    );
  }

  return result;
};
