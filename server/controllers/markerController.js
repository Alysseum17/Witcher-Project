import { Marker } from '../models/markerModel.js';
import * as crudFactory from '../utils/crudFactory.js';

export const getAllMarkers = crudFactory.getAll(Marker);
export const getMarker = crudFactory.getOne(Marker);
export const createMarker = crudFactory.createOne(Marker);
export const updateMarker = crudFactory.updateOne(Marker);
export const deleteMarker = crudFactory.deleteOne(Marker);
