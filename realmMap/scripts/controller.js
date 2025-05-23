import map from './viewMap.js';
import { mapName } from './helper.js';
import { data, descriptions, names } from './modal.js';
const init = () => {
  map.init();
  map.createSideBar(data, names);
  map.createMarkers(data, descriptions, names);
  if (localStorage.getItem(mapName))
    map.createMarkers(localStorage.getItem(mapName), descriptions, names, true);
  map.pulseOneMarkerListener();
  map.removeMarkerListener();
  map.removeAllMarkersListener();
  map.hideAllListener();
  map.hideListener();
  map.createMarkerListener();
  map._activateWitchers();
};
init();
