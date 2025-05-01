import map from './viewMap.js';
import { data, descriptions } from './modal.js';
const init = () => {
  map.init();
  map.createSideBar(data);
  map.createMarkers(data, descriptions);
  if (localStorage.getItem('waypoint'))
    map.createMarkers(localStorage.getItem('waypoint'), descriptions, true);
  map.removeMarkerListener();
  map.removeAllMarkersListener();
  map.hideAllListener();
  map.hideListener();
  map.createMarkerListener();
};
init();
