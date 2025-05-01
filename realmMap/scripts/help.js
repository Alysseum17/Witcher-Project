import { imageUrl, mapCenter, initialZoom, imageBounds } from './helper.js';
import L from 'leaflet.js';
const map = L.map('map', {
  crs: L.CRS.Simple,
  center: mapCenter,
  zoom: initialZoom,
  minZoom: -2,
  maxZoom: 2,
  attributionControl: false,
});

L.imageOverlay(imageUrl, imageBounds).addTo(map);

map.setMaxBounds(imageBounds);
const features = {
  abandoned: [],
  alchemy: [],
  armourer: [],
  armourerstable: [],
  banditcamp: [],
  barber: [],
  blacksmith: [],
  boat: [],
  brothel: [],
  entrance: [],
  fasttravel: [],
  grindstone: [],
  guarded: [],
  gwent: [],
  hansebase: [],
  harbor: [],
  herbalist: [],
  hidden: [],
  kid: [],
  merchant: [],
  monsterden: [],
  monsternest: [],
  notice: [],
  pid: [],
  placeofpower: [],
  pointofinterest: [],
  signalfire: [],
  smugglers: [],
  spoils: [],
  tavern: [],
  vineyardinfestation: [],
};
map.on('click', onMapClick);

function onMapClick(e) {
  const { lat, lng } = e.latlng;

  const formHtml = `
    <form id="featureForm">
      <label>Type: <input name="type"  required></label><br/>
      <label>Name: <input name="title"  required></label><br/>
      <label>Description: <textarea name="descr"></textarea></label><br/>
      <button type="submit">Зберегти</button>
    </form>
  `;

  const popup = L.popup().setLatLng(e.latlng).setContent(formHtml).openOn(map);

  document.getElementById('featureForm').addEventListener('submit', (ev) => {
    ev.preventDefault();

    const data = Object.fromEntries(new FormData(ev.target).entries());
    const type = data.type.toLowerCase().trim();
    const feature = {
      title: data.title,
      descr: data.descr,
      lat,
      lng,
    };

    features[type].push(feature);

    map.closePopup(popup);
  });
}
