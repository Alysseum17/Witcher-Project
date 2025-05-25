const width = {
  'white-orchard': 5100,
  'hos-velen': 8200,
  skellige: 7400,
  'kaer-morhen': 4100,
  toussaint: 4600,
};
const height = {
  'white-orchard': 4100,
  'hos-velen': 9200,
  skellige: 7400,
  'kaer-morhen': 5100,
  toussaint: 4600,
};
export const apiUrl = 'http://localhost:3000/api/v1';
const params = new URLSearchParams(window.location.search);
export const mapName = params.get('map') || 'default';
export const imageWidth = width[mapName];
export const imageHeight = height[mapName];
export const imageUrl = `../images/${mapName}.webp`;
export const mapCenter = [imageHeight / 2, imageWidth / 2];
export const initialZoom = -1;
export const imageBounds = [
  [0, 0],
  [imageHeight, imageWidth],
];
// Generators
// const colorCycle = function* (list = ['#c00', '#0c0', '#00c', '#cc0']) {
//   for (;;) for (const c of list) yield c;
// };

// const randomFeatureCoords = function* (featureGroup) {
//   while (true) {
//     const layers = Object.values(featureGroup._layers);
//     const r = Math.floor(Math.random() * layers.length);
//     yield layers[r].getLatLng();
//   }
// };
export const opacityGenerator = function* () {
  while (true) {
    yield 0.3;
    yield 1;
  }
};

export const consumeWithTimeout = function (
  iterator,
  ms,
  func,
  interval = 200,
) {
  const deadline = Date.now() + ms;
  (function step() {
    if (Date.now() >= deadline) {
      func(1);
      return;
    }
    const { value, done } = iterator.next();
    if (done) {
      func(1);
      return;
    }
    func(value);
    setTimeout(step, interval);
  })();
};

const bus = new EventTarget();
export const publish = (eventName, detail) => {
  const e = new CustomEvent(eventName, { detail });
  bus.dispatchEvent(e);
};
export const subscribe = (eventName, handler) => {
  const wrapper = (event) => handler(event.detail);
  bus.addEventListener(eventName, wrapper);
  return () => bus.removeEventListener(eventName, wrapper);
};

export const groupFeaturesByClass = (features) => {
  const groups = Array.isArray(features)
    ? features.reduce((acc, item) => {
        const key = item.class;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {})
    : features;

  return groups;
};
