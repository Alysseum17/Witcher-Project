import { Marker } from '../models/markerModel.js';
import APIMethods from '../utils/apiMethods.js';
import OperationError from '../utils/operationError.js';
export const getAllMarkers = async (request, reply) => {
  const featureply = new APIMethods(Marker.find(), request.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const markers = await featureply.query;

  reply.code(200).send({
    code: 'success',
    replyults: markers.length,
    data: {
      markers,
    },
  });
};
export const getMarker = async (request, reply) => {
  const marker = await Marker.findById(request.params.id);
  if (!marker) throw new OperationError('No marker found with that ID', 404);

  reply.code(200).send({
    code: 'success',
    data: {
      marker,
    },
  });
};

export const createMarker = async (request, reply) => {
  const newMarker = await Marker.create(request.body);

  reply.code(201).send({
    code: 'success',
    data: {
      marker: newMarker,
    },
  });
};
export const updateMarker = async (request, reply) => {
  const marker = await Marker.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!marker) throw new OperationError('No marker found with that ID', 404);

  reply.code(200).send({
    code: 'success',
    data: {
      marker,
    },
  });
};

export const deleteMarker = async (request, reply) => {
  const marker = await Marker.findByIdAndDelete(request.params.id);

  if (!marker) throw new OperationError('No marker found with that ID', 404);

  reply.code(204).send({
    code: 'success',
    data: null,
  });
};
