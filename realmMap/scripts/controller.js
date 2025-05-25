import map from './viewMap.js';
import { data, names } from './dataLoader.js';
const init = async () => {
  map.init();
  map.createSideBar(data, names);
  map.createMarkers(data, names);
  map.pulseOneMarkerListener();
  map.removeMarkerListener();
  map.removeAllMarkersListener();
  map.hideAllListener();
  map.hideListener();
  map.createMarkerListener();
  map._activateWitchers();
};
init();
