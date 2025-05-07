import map from './viewMap.js';
import { data, descriptions, names } from './modal.js';
const init = () => {
  map.init();
  map.createSideBar(data, names);
  map.createMarkers(data, descriptions, names);
  // // ► Запустити «ефект маяка» на Waypoints відразу

  // // ► Увімкнути автофокус на POI
  // map.startAutoFocus('pointofinterest');
  if (localStorage.getItem('waypoint'))
    map.createMarkers(
      localStorage.getItem('waypoint'),
      descriptions,
      names,
      true,
    );
  map.pulseOneMarker();
  map.removeMarkerListener();
  map.removeAllMarkersListener();
  map.hideAllListener();
  map.hideListener();
  map.createMarkerListener();
};
init();
