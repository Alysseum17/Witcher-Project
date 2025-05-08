import map from './viewMap.js';
import { data, descriptions, names } from './modal.js';
const init = () => {
  map.init();
  map.createSideBar(data, names);
  map.createMarkers(data, descriptions, names);
  if (localStorage.getItem('waypoint'))
    map.createMarkers(
      localStorage.getItem('waypoint'),
      descriptions,
      names,
      true,
    );
  map.pulseOneMarkerListener();
  map.removeMarkerListener();
  map.removeAllMarkersListener();
  map.hideAllListener();
  map.hideListener();
  map.createMarkerListener();
};
init();
