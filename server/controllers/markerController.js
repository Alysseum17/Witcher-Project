import { Marker } from '../models/markerModel.js';
import OperationError from '../utils/operationError.js';
import * as crudFactory from '../utils/crudFactory.js';

export const getAllMarkers = crudFactory.getAll(Marker);
export const getMarker = crudFactory.getOne(Marker);
export const createMarker = crudFactory.createOne(Marker);
export const updateMarker = crudFactory.updateOne(Marker);
export const deleteMarker = crudFactory.deleteOne(Marker);

export const getPublicMarkers = async (request, reply) => {
  const markers = await Marker.find({ isPublic: true });
  reply.send({
    status: 'success',
    data: {
      markers,
    },
  });
};

export const getOwnMarkers = async (request, reply) => {
  const markers = await Marker.find({
    owner: request.user._id,
    isPublic: false,
  });
  reply.send({
    status: 'success',
    data: {
      markers,
    },
  });
};

export const createOwnMarker = async (request, reply) => {
  if (!request.body.title)
    throw new OperationError('Please provide a title!', 400);
  const newMarker = await Marker.create({
    ...request.body,
    owner: request.user._id,
    isPublic: false,
  });
  reply.send({
    status: 'success',
    data: {
      marker: newMarker,
    },
  });
};

export const deleteAllOwnMarkers = async (request, reply) => {
  const { lat, lng } = request.query;
  const filter = {
    owner: request.user._id,
    isPublic: false,
  };
  if (lat && lng) {
    filter.lat = parseFloat(lat);
    filter.lng = parseFloat(lng);
  }
  const deletedMarkers = await Marker.deleteMany(filter);
  if (deletedMarkers.deletedCount === 0) {
    throw new OperationError('No markers found to delete!', 404);
  }
  reply.send({
    status: 'success',
    data: {
      markers: deletedMarkers,
      deletedCount: deletedMarkers.deletedCount,
    },
  });
};
