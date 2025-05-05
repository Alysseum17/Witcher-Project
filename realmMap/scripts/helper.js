const width = {
  whiteOrchard: 5100,
  hosVelen: 8200,
  skellige: 7400,
  kaerMorhen: 4100,
  toussaint: 4600,
};
const height = {
  whiteOrchard: 4100,
  hosVelen: 9200,
  skellige: 7400,
  kaerMorhen: 5100,
  toussaint: 4600,
};
export const mapName = location.pathname.split('/').pop().replace('.html', '');
export const imageWidth = width[mapName];
export const imageHeight = height[mapName];
export const imageUrl = `../images/${mapName}.webp`;
export const mapCenter = [imageHeight / 2, imageWidth / 2];
export const initialZoom = -1;
export const imageBounds = [
  [0, 0],
  [imageHeight, imageWidth],
];
