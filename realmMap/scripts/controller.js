import map from './viewMap.js';
import { data, names } from './dataLoader.js';
import { apiJSON } from '../../script/apiClient.js';
import { isLoggedIn } from './helper.js';
const init = async () => {
  map.init();
  map.createSideBar(data, names);
  map.createMarkers(data, names);
  if (isLoggedIn) {
    const res = await apiJSON('http://localhost:3000/api/v1/markers/own', {
      method: 'GET',
    });
    const { markers } = res.data;
    map.createMarkers(markers);
  }
  map.pulseOneMarkerListener();
  map.removeMarkerListener();
  map.removeAllMarkersListener();
  map.hideAllListener();
  map.hideListener();
  map.createMarkerListener();
  map._activateWitchers();
};
init();
