import * as helper from './helper.js';
import { apiJSON } from '../../script/apiClient.js';
class Map {
  #map = L.map('map', {
    crs: L.CRS.Simple,
    center: helper.mapCenter,
    zoom: helper.initialZoom,
    minZoom: -2,
    maxZoom: 2,
    attributionControl: false,
  });
  #isShown = true;
  #imageUrl;
  #imageBounds;
  #mapName;
  #contracts = [];
  #featureGroup = {};
  #btnDeleteOne = document.querySelector('.del--markers--one');
  #btnDeleteAll = document.querySelector('.del--markers');
  #btnHideAll = document.querySelector('.hide');
  #sideBar = document.querySelector('.side--bar');
  #ownType = 'waypoint';
  #activitiesList = document.querySelector('.activities');
  #modalWindow = document.querySelector('.modal--box');
  #overlay = document.querySelector('.modal-overlay');
  #btnConfirmModal = document.querySelector('.btn--yes');
  #btnCloseModal = document.querySelector('.btn--no');
  #witchers = document.querySelector('.witchers');
  #message = document.querySelector('.message');
  #contractText = document.querySelector('.contract--text');
  #isProcessing = false;
  #waitingWitchers = [];
  #witcherSubscriptions = {};

  constructor(imageUrl, imageBounds, mapName) {
    this.#imageUrl = imageUrl;
    this.#imageBounds = imageBounds;
    this.#mapName = mapName;
  }

  init() {
    this.#map.setMaxBounds(this.#imageBounds);
    L.imageOverlay(this.#imageUrl, this.#imageBounds).addTo(this.#map);
  }
  createMarkers(features, names = {}) {
    const groups = helper.groupFeaturesByClass(features);
    Object.entries(groups).forEach(([key, items]) => {
      if (!this.#featureGroup[key]) this.#featureGroup[key] = L.featureGroup();
      const counterEl = document.querySelector(`.${key} .counter`);
      if (counterEl) counterEl.textContent = items.length;
      items.forEach((item) => {
        const marker = L.marker([item.lat, item.lng], {
          icon: L.icon({
            iconUrl: `./images/icons/${key}.png`,
            iconSize: [25, 35],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        });

        marker.bindPopup(`
          <span class="heading">${item.title || names[key] || key}</span><br>
          ${item.description || ''}
        `);

        marker.bindTooltip(item.title || names[key] || key, {
          offset: L.point(10, -25),
        });

        marker.on('click', () => {
          this.#map.setView([item.lat, item.lng], this.#map.getZoom());
        });

        this.#featureGroup[key].addLayer(marker);
      });

      this.#featureGroup[key].addTo(this.#map);
    });
  }
  createSideBar(features, names) {
    const groups = helper.groupFeaturesByClass(features);
    for (const [key, value] of Object.entries(groups)) {
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
    this.#overlay.addEventListener('click', this._cancelDelete.bind(this));
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
  async _createOwnMarker(e) {
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
        <select name="monster" required>
          <option value="" disabled selected>Select a monster…</option>
          <option value="griffin">Griffin</option>
          <option value="fiend">Fiend</option>
          <option value="leshen">Leshen</option>
          <option value="drowner">Drowner</option>
          <option value="kikimora">Kikimora</option>
          <option value="noonwraith">Noonwraith</option>
          <option value="doppler">Doppler</option>
          <option value="water-hag">Water Hag</option>
          <option value="wyvern">Wyvern</option>
          <option value="striga">Striga</option>
        </select>
        </label>
        <label>Reward:
          <input type="number" name="reward" min="0" required />
        </label>
       <label>Difficulty:
         <select name="difficulty" required>
          <option value="" disabled selected>Select contract difficulty...</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>        
          <option value="hard">Hard</option>
          <option value="very-hard">Very Hard</option>
        </select>
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

    const attachHandler = async () => {
      if (document.getElementById('markerForm')) {
        document
          .getElementById('markerForm')
          .addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const data = Object.fromEntries(new FormData(ev.target).entries());
            const feature = {
              map: this.#mapName,
              class: this.#ownType,
              title: data.title,
              description: data.descr,
              lat,
              lng,
            };
            this.#map.closePopup(popup);
            try {
              const res = await apiJSON(
                'http://localhost:3000/api/v1/markers/own',
                {
                  method: 'POST',
                  body: JSON.stringify(feature),
                },
              );
              console.log(res);
              const markerInf = res.data.marker;
              this.createMarkers([markerInf]);
            } catch (err) {
              console.error('Error creating marker:', err);
            }
          });
      }
      if (document.getElementById('contractForm')) {
        document
          .getElementById('contractForm')
          .addEventListener('submit', (ev) => {
            ev.preventDefault();
            const data = Object.fromEntries(new FormData(ev.target).entries());
            this._showToast(
              `New contract for ${data.monster} for ${data.reward} crowns`,
            );
            helper.publish('new-contract', {
              monster: data.monster,
              reward: data.reward,
              coords: { lat, lng },
              duration:
                data.difficulty === 'easy'
                  ? 5000
                  : data.difficulty === 'moderate'
                    ? 10000
                    : data.difficulty === 'hard'
                      ? 15000
                      : 20000,
            });
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: `images/icons/tempcontract.png`,
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
                duration:
                  data.difficulty === 'easy'
                    ? 5000
                    : data.difficulty === 'moderate'
                      ? 10000
                      : data.difficulty === 'hard'
                        ? 15000
                        : 20000,
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
    this.#modalWindow.classList.add('active');
    this.#overlay.classList.add('active');
  }
  async _confirmDelete(e) {
    e.preventDefault();
    if (!helper.isLoggedIn) return;
    try {
      const res = await fetch('http://localhost:3000/api/v1/markers/own', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        this._showToast('No markers to delete', 2000);
        this.#modalWindow.classList.remove('active');
        this.#overlay.classList.remove('active');
        return;
      }
      const data = await res.json();
      const { deletedCount } = data.data;
      if (deletedCount > 0) {
        this.#map.removeLayer(this.#featureGroup.waypoint);
        this.#featureGroup.waypoint.clearLayers();
      }
      this._showToast('All markers deleted', 2000);
    } catch (err) {
      console.error('Error deleting markers:', err);
    }
    this.#modalWindow.classList.remove('active');
    this.#overlay.classList.remove('active');
  }
  _cancelDelete(e) {
    e.preventDefault();
    this.#modalWindow.classList.remove('active');
    this.#overlay.classList.remove('active');
  }

  async _removeOneMarker(e) {
    e.preventDefault();
    if (!helper.isLoggedIn) return;
    this._cancelMarkerDelete();
    this.#btnDeleteOne.classList.add('is--active');
    if (this.#featureGroup[this.#ownType]) {
      this.#featureGroup[this.#ownType].once('click', async (e) => {
        this.#btnDeleteOne.classList.remove('is--active');
        const marker = e.layer;
        this.#map.removeLayer(marker);
        this.#featureGroup.waypoint.removeLayer(marker);
        const { lat, lng } = marker.getLatLng();
        await fetch(
          `http://localhost:3000/api/v1/markers/own?lat=${lat}&lng=${lng}`,
          { method: 'DELETE', credentials: 'include' },
        );
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
    const gen = helper.opacityGenerator();
    helper.consumeWithTimeout(
      gen,
      5000,
      (opacity) => {
        group.eachLayer((layer) => layer.setOpacity(opacity));
      },
      250,
    );
  }
  _showToast(text, duration = 1000) {
    this.#message.classList.add('active');
    this.#overlay.classList.add('active');
    this.#contractText.innerHTML += `${text}<br>`;
    setTimeout(() => {
      this.#message.classList.remove('active');
      this.#overlay.classList.remove('active');
      this.#contractText.innerHTML = '';
    }, duration);
  }
  _activateWitchers() {
    this.#witchers.addEventListener('click', (e) => {
      const card = e.target.closest('.witcher--card');
      if (!card) return;

      const { name } = card.dataset;
      card.classList.toggle('witcher--active');

      if (card.classList.contains('witcher--active')) {
        this.#witcherSubscriptions[name] = this._subscribeWitcher(name);
        if (this.#contracts.length > 0) {
          helper.publish('new-contract', this.#contracts[0][1]);
        }
      } else {
        this.#witcherSubscriptions[name]?.();
        this.#witcherSubscriptions[name] = null;
      }
    });
  }
  _subscribeWitcher(name) {
    return helper.subscribe(
      'new-contract',
      ({ monster, reward, coords, duration }) => {
        if (this.#isProcessing) {
          this.#waitingWitchers.push(name);
          return;
        }
        this.#isProcessing = true;
        const witcherCard = document.querySelector(`.${name.toLowerCase()}`);
        if (witcherCard) {
          witcherCard.classList.remove('witcher--active');
        }

        this._showToast(
          `${name} takes the ${monster} contract for ${reward} crowns`,
        );
        setTimeout(() => {
          const index = this.#contracts.findIndex(
            ([, c]) =>
              c.coords.lat === coords.lat && c.coords.lng === coords.lng,
          );
          if (index !== -1) {
            const [mkr] = this.#contracts[index];
            this.#map.removeLayer(mkr);
            this.#contracts.splice(index, 1);
          }

          this.#isProcessing = false;

          if (this.#waitingWitchers.length > 0) {
            const nextWitcher = this.#waitingWitchers.shift();
            this.#witcherSubscriptions[nextWitcher]?.();
            this.#witcherSubscriptions[nextWitcher] =
              this._subscribeWitcher(nextWitcher);
            if (this.#contracts.length > 0) {
              helper.publish('new-contract', this.#contracts[0][1]);
            }
          }
        }, duration);

        if (this.#witcherSubscriptions[name]) {
          this.#witcherSubscriptions[name]();
          this.#witcherSubscriptions[name] = null;
        }
      },
    );
  }
}

export default new Map(helper.imageUrl, helper.imageBounds, helper.mapName);
