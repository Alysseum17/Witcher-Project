import { imageUrl, mapCenter, initialZoom, imageBounds } from './helper.js';
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

  constructor(imageUrl, imageBounds) {
    this.#imageUrl = imageUrl;
    this.#imageBounds = imageBounds;
  }

  init() {
    this.#map.setMaxBounds(this.#imageBounds);
    L.imageOverlay(this.#imageUrl, this.#imageBounds).addTo(this.#map);
  }
  createMarkers(features, descriptions = [], ownMarker = false) {
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
          descriptions[key]
            ? `<span class = "heading">${item.title}</span>
          <br>${descriptions[key]}`
            : `<span class = "heading">${item.title}</span>
          <br>${item.descr}`,
        );
        marker.bindTooltip(item.title, {
          offset: L.point(10, -25),
        });
        marker.on('click', () => {
          const { lat, lng } = item;
          this.#map.setView([lat, lng], 0);
        });
      });
      this.#featureGroup[key].addTo(this.#map);
    }
  }

  createSideBar(features) {
    for (const [key, value] of Object.entries(features)) {
      if (value.length > 0) {
        const markup = `
          <div class="activity" data-name = "${key}">
              <img src="images/icons/${key}.png" />
              <p class="name">${value[0].title}</p>
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
    const formHtml = `
        <form class="popup-form" id="featureForm">
          <label>Name:
            <input type="text" name="title" required />
          </label>

          <label>Description:
            <textarea name="descr"></textarea>
          </label>

          <button type="submit">Save</button>
        </form>
      `;
    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(formHtml)
      .openOn(this.#map);
    document.getElementById('featureForm').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = Object.fromEntries(new FormData(ev.target).entries());
      const feature = {
        title: data.title,
        descr: data.descr,
        lat,
        lng,
      };
      this.#map.closePopup(popup);
      const raw = localStorage.getItem(this.#ownType);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(feature);
      localStorage.setItem(this.#ownType, JSON.stringify(arr));
      this.createMarkers(localStorage.getItem(this.#ownType), [], true);
    });
  }
  _openModal(e) {
    e.preventDefault();
    this.#modalWindow.classList.add('open--modal');
  }
  _confirmDelete(e) {
    e.preventDefault();
    const raw = localStorage.getItem(this.#ownType);
    if (raw) {
      localStorage.removeItem(this.#ownType);
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
        const raw = localStorage.getItem(this.#ownType);
        const arr = raw ? JSON.parse(raw) : [];
        const { lat, lng } = marker.getLatLng();
        const index = arr.findIndex(
          (item) => item.lat === lat && item.lng === lng,
        );
        if (index !== -1) {
          arr.splice(index, 1);
          localStorage.setItem(this.#ownType, JSON.stringify(arr));
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
}

export default new Map(imageUrl, imageBounds);
