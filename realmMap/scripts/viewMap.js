import {
  imageUrl,
  mapCenter,
  initialZoom,
  imageBounds,
  opacityGenerator,
  consumeWithTimeout,
  subscribe,
  publish,
  mapName,
} from './helper.js';
class Map {
  #map = L.map('map', {
    crs: L.CRS.Simple,
    center: mapCenter,
    zoom: initialZoom,
    minZoom: -2,
    maxZoom: 2,
    attributionControl: false,
  });
  #isShown = true;
  #imageUrl;
  #imageBounds;
  #mapName;
  #contracts = [];
  #offSubscriptions = {};
  #activeWitchers = [];
  #featureGroup = {};
  #btnDeleteOne = document.querySelector('.del--markers--one');
  #btnDeleteAll = document.querySelector('.del--markers');
  #btnHideAll = document.querySelector('.hide');
  #sideBar = document.querySelector('.side--bar');
  #ownType = 'waypoint';
  #activitiesList = document.querySelector('.activities');
  #modalWindow = document.querySelector('.modal');
  #btnConfirmModal = document.querySelector('.btn--yes');
  #btnCloseModal = document.querySelector('.btn--no');
  #witchers = document.querySelector('.witchers');

  constructor(imageUrl, imageBounds) {
    this.#imageUrl = imageUrl;
    this.#imageBounds = imageBounds;
    this.#mapName = mapName;
  }

  init() {
    this.#map.setMaxBounds(this.#imageBounds);
    L.imageOverlay(this.#imageUrl, this.#imageBounds).addTo(this.#map);
  }
  createMarkers(features, descriptions = [], names = [], ownMarker = false) {
    const featuresObj = ownMarker ? JSON.parse(features) : features;
    const entries = ownMarker
      ? [[this.#ownType, featuresObj]]
      : Object.entries(featuresObj);
    for (const [key, value] of entries) {
      if (!this.#featureGroup[key]) {
        this.#featureGroup[key] = L.featureGroup();
      } else {
        this.#featureGroup[key].clearLayers();
      }
      if (document.querySelector(`.${key}`))
        document.querySelector(`.${key}`).textContent = value.length;
      value.forEach((item) => {
        const marker = L.marker(item, {
          icon: L.icon({
            iconUrl: `./images/icons/${key}.png`,
            iconSize: [25, 35],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        });
        this.#featureGroup[key].addLayer(marker);
        marker.bindPopup(
          `<span class = "heading">${item.title || names[key]}</span>
          <br>${key === 'pointofinterest' ? '' : item.descr || descriptions[key]}`,
        );
        marker.bindTooltip(`${key === 'waypoint' ? item.title : names[key]}`, {
          offset: L.point(10, -25),
        });
        marker.on('click', () => {
          const { lat, lng } = item;
          this.#map.setView([lat, lng], this.#map.getZoom());
        });
      });
      this.#featureGroup[key].addTo(this.#map);
    }
  }

  createSideBar(features, names) {
    for (const [key, value] of Object.entries(features)) {
      if (value.length > 0) {
        const markup = `
          <div class="activity" data-name = "${key}">
              <img src="images/icons/${key}.png" />
              <p class="name">${names[key]}</p>
              <p class="counter">${value.length}</p>
          </div>
        `;
        this.#activitiesList.insertAdjacentHTML('beforeend', markup);
      }
    }
  }
  hideAllListener() {
    this.#btnHideAll.addEventListener('click', this._hideAll.bind(this));
  }
  hideListener() {
    this.#activitiesList.addEventListener('click', this._hideOne.bind(this));
  }
  createMarkerListener() {
    this.#map.on('contextmenu', this._createOwnMarker.bind(this));
  }
  removeMarkerListener() {
    this.#btnDeleteOne.addEventListener(
      'click',
      this._removeOneMarker.bind(this),
    );
  }
  removeAllMarkersListener() {
    this.#btnDeleteAll.addEventListener('click', this._openModal.bind(this));
    this.#btnConfirmModal.addEventListener(
      'click',
      this._confirmDelete.bind(this),
    );
    this.#btnCloseModal.addEventListener(
      'click',
      this._cancelDelete.bind(this),
    );
  }
  pulseOneMarkerListener() {
    this.#activitiesList.addEventListener(
      'contextmenu',
      this._startMarkerPulse.bind(this),
    );
  }
  _hideAll(e) {
    e.preventDefault();
    if (this.#isShown) {
      this.#isShown = false;
      e.target.classList.contains('name--show')
        ? (e.target.textContent = 'Show all')
        : e.target.querySelector('.name--show')
          ? (e.target.querySelector('.name--show').textContent = 'Show all')
          : (e.target.previousElementSibling.textContent = 'Show all');
      document
        .querySelectorAll('.name')
        .forEach((el) => el.classList.add('strike-through'));
      document
        .querySelectorAll('.counter')
        .forEach((el) => el.classList.add('hide--counter'));
      for (const value of Object.values(this.#featureGroup)) {
        this.#map.removeLayer(value);
      }
    } else {
      this.#isShown = true;
      e.target.classList.contains('name--show')
        ? (e.target.textContent = 'Hide all')
        : e.target.querySelector('.name--show')
          ? (e.target.querySelector('.name--show').textContent = 'Hide all')
          : (e.target.previousElementSibling.textContent = 'Hide all');
      document
        .querySelectorAll('.name')
        .forEach((el) => el.classList.remove('strike-through'));
      document
        .querySelectorAll('.counter')
        .forEach((el) => el.classList.remove('hide--counter'));
      for (const value of Object.values(this.#featureGroup)) {
        this.#map.addLayer(value);
      }
    }
    document.querySelector('.show').src =
      `images/icons/${this.#isShown ? 'show' : 'hide'}.png`;
  }
  _hideOne(e) {
    e.preventDefault();
    const activity = e.target.closest('.activity');
    if (activity) {
      const element = activity.dataset.name;
      if (this.#map.hasLayer(this.#featureGroup[element])) {
        this.#map.removeLayer(this.#featureGroup[element]);
      } else {
        this.#map.addLayer(this.#featureGroup[element]);
      }
      activity.querySelector('.name').classList.toggle('strike-through');
      activity.querySelector('.counter').classList.toggle('hide--counter');
    }
  }
  _createOwnMarker(e) {
    const { lat, lng } = e.latlng;

    const markerForm = `
      <form class="popup-form" id="markerForm">
        <label>Name:
          <input type="text" name="title" required />
        </label>
        <label>Description:
          <textarea name="descr"></textarea>
        </label>
        <button type="submit" class="btnPopup" >Save Marker</button>
      </form>
    `;
    const contractForm = `
      <form class="popup-form" id="contractForm">
        <label>Monster:
          <input type="text" name="monster" required></input>
        </label>
        <label>Reward:
          <input type="number" name="reward" min="0" required />
        </label>
        <button type="submit" class="btnPopup" >Save Contract</button>
      </form>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="formContainer">${markerForm}</div>
      <button class="btnPopup switchBtn" style="margin-top:8px;">Switch to Contract</button>
    `;
    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(wrapper)
      .openOn(this.#map);

    const attachHandler = () => {
      if (document.getElementById('markerForm')) {
        document
          .getElementById('markerForm')
          .addEventListener('submit', (ev) => {
            ev.preventDefault();
            const data = Object.fromEntries(new FormData(ev.target).entries());
            const feature = { title: data.title, descr: data.descr, lat, lng };
            this.#map.closePopup(popup);
            const raw = localStorage.getItem(this.#mapName);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(feature);
            localStorage.setItem(this.#mapName, JSON.stringify(arr));
            this.createMarkers(
              localStorage.getItem(this.#mapName),
              [],
              [],
              true,
            );
          });
      }
      if (document.getElementById('contractForm')) {
        document
          .getElementById('contractForm')
          .addEventListener('submit', (ev) => {
            ev.preventDefault();
            const data = Object.fromEntries(new FormData(ev.target).entries());
            console.log('New contract:', data.monster, data.reward);
            publish('new-contract', {
              monster: data.monster,
              reward: data.reward,
              coords: { lat, lng },
            });
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: `./images/icons/tempcontract.png`,
                iconSize: [25, 35],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              }),
            }).addTo(this.#map);
            marker.bindPopup(
              `<span class = "heading">Contract</span>
              <br>Contract for ${data.monster} for ${data.reward} crowns}`,
            );
            this.#contracts.push([
              marker,
              {
                monster: data.monster,
                reward: data.reward,
                coords: { lat, lng },
              },
            ]);
            this.#map.closePopup(popup);
          });
      }
    };
    attachHandler();
    wrapper.querySelector('.switchBtn').addEventListener('click', () => {
      const container = wrapper.querySelector('#formContainer');
      if (container.querySelector('#markerForm')) {
        container.innerHTML = contractForm;
        wrapper.querySelector('.switchBtn').textContent = 'Switch to Marker';
      } else {
        container.innerHTML = markerForm;
        wrapper.querySelector('.switchBtn').textContent = 'Switch to Contract';
      }
      attachHandler();
    });
  }
  _openModal(e) {
    e.preventDefault();
    this.#modalWindow.classList.add('open--modal');
  }
  _confirmDelete(e) {
    e.preventDefault();
    const raw = localStorage.getItem(this.#mapName);
    if (raw) {
      localStorage.removeItem(this.#mapName);
      this.#map.removeLayer(this.#featureGroup.waypoint);
      this.#featureGroup.waypoint.clearLayers();
    }
    this.#modalWindow.classList.remove('open--modal');
  }
  _cancelDelete(e) {
    e.preventDefault();
    this.#modalWindow.classList.remove('open--modal');
  }

  _removeOneMarker(e) {
    e.preventDefault();
    this._cancelMarkerDelete();
    this.#btnDeleteOne.classList.add('is--active');
    if (this.#featureGroup[this.#ownType]) {
      this.#featureGroup[this.#ownType].once('click', (e) => {
        this.#btnDeleteOne.classList.remove('is--active');
        const marker = e.layer;
        this.#map.removeLayer(marker);
        this.#featureGroup.waypoint.removeLayer(marker);
        const raw = localStorage.getItem(this.#mapName);
        const arr = raw ? JSON.parse(raw) : [];
        const { lat, lng } = marker.getLatLng();
        const index = arr.findIndex(
          (item) => item.lat === lat && item.lng === lng,
        );
        if (index !== -1) {
          arr.splice(index, 1);
          localStorage.setItem(this.#mapName, JSON.stringify(arr));
        }
      });
    }
  }
  _cancelMarkerDelete() {
    const func = (e) => {
      e.preventDefault();
      if (!e.target.classList.contains('del--markers--one')) {
        this.#btnDeleteOne.classList.remove('is--active');
        this.#featureGroup[this.#ownType] &&
          this.#featureGroup[this.#ownType].off('click');
        this.#sideBar.removeEventListener('click', func);
      }
    };
    this.#sideBar.addEventListener('click', func);
  }
  _startMarkerPulse(e) {
    e.preventDefault();
    const activity = e.target.closest('.activity');
    if (!activity) return;
    const key = activity.dataset.name;
    const group = this.#featureGroup[key];
    if (!group) return;
    const gen = opacityGenerator();
    consumeWithTimeout(
      gen,
      5000,
      (opacity) => {
        group.eachLayer((layer) => layer.setOpacity(opacity));
      },
      250,
    );
  }
  _showToast(text, duration = 1000) {
    const container = document.querySelector('.message');
    const textInfo = document.querySelector('.contract--text');
    container.classList.add('open--modal');
    textInfo.textContent = text;
    setTimeout(() => container.classList.remove('open--modal'), duration);
  }
  _activateWitchers() {
    this.#witchers.addEventListener('click', (e) => {
      const card = e.target.closest('.witcher--card');
      if (!card) return;

      const name = card.dataset.name;
      card.classList.toggle('witcher--active');

      if (card.classList.contains('witcher--active')) {
        this.#activeWitchers.push(name);
        this.#offSubscriptions[name] = this._subscribeWitcher(name);
        if (this.#contracts.length > 0) {
          publish('new-contract', this.#contracts[0][1]);
        }
      } else {
        this.#activeWitchers = this.#activeWitchers.filter((n) => n !== name);
        this.#offSubscriptions[name]?.();
        this.#offSubscriptions[name] = '';
      }
    });
  }
  _subscribeWitcher(name) {
    return subscribe('new-contract', ({ monster, reward, coords }) => {
      document
        .querySelector(`.${name.toLowerCase()}`)
        .classList.remove('witcher--active');
      this._showToast(
        `${name} takes the ${monster} contract for ${reward} crowns`,
      );
      setTimeout(() => {
        const index = this.#contracts.findIndex(
          ([, c]) => c.coords.lat === coords.lat && c.coords.lng === coords.lng,
        );
        if (index !== -1) {
          const [mkr] = this.#contracts[index];
          this.#map.removeLayer(mkr);
          this.#contracts.splice(index, 1);
        }
      }, 10000);
      this.#offSubscriptions[name]?.();
    });
  }
  // startAutoFocus(key = 'pointofinterest') {
  //   if (!this.#featureGroup[key]) return;
  //   const coordsGen = randomFeatureCoords(this.#featureGroup[key]);
  //   this._focusInterval && clearInterval(this._focusInterval);
  //   this._focusInterval = setInterval(() => {
  //     const { lat, lng } = coordsGen.next().value;
  //     this.#map.setView([lat, lng], this.#map.getZoom());
  //   }, 5000);
  // }
}

export default new Map(imageUrl, imageBounds);
