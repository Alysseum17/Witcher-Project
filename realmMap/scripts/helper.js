export const mapName = location.pathname.split('/').pop().replace('.html', '');
export const imageWidth =
  mapName === 'whiteOrchard'
    ? 5100
    : mapName === 'hosVelen'
      ? 8200
      : mapName === 'skellige'
        ? 7400
        : mapName === 'kaerMorhen'
          ? 4100
          : mapName === 'toussaint'
            ? 4600
            : 0;
export const imageHeight =
  mapName === 'whiteOrchard'
    ? 4100
    : mapName === 'hosVelen'
      ? 9200
      : mapName === 'skellige'
        ? 7400
        : mapName === 'kaerMorhen'
          ? 5100
          : mapName === 'toussaint'
            ? 4600
            : 0;
export const imageUrl = `../images/${mapName}.webp`;
export const mapCenter = [imageHeight / 2, imageWidth / 2];
export const initialZoom = -1;
export const imageBounds = [
  [0, 0],
  [imageHeight, imageWidth],
];
