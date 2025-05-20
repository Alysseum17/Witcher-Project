import OperationError from './operationError.js';
import APIMethods from './apiMethods.js';

export const getAll = (Model) => async (request, reply) => {
  const feature = new APIMethods(Model.find(), request.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const docs = await feature.query;

  reply.code(200).send({
    code: 'success',
    results: docs.length,
    data: {
      [Model.modelName.toLowerCase()]: docs,
    },
  });
};

export const getOne = (Model) => async (request, reply) => {
  const doc = await Model.findById(request.params.id);
  if (!doc) throw new OperationError('No document found with that ID', 404);
  reply.code(200).send({
    code: 'success',
    data: {
      [Model.modelName.toLowerCase()]: doc,
    },
  });
};

export const createOne = (Model) => async (request, reply) => {
  const newDoc = await Model.create(request.body);

  reply.code(201).send({
    code: 'success',
    data: {
      [Model.modelName.toLowerCase()]: newDoc,
    },
  });
};

export const updateOne = (Model) => async (request, reply) => {
  const doc = await Model.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new OperationError('No document found with that ID', 404);

  reply.code(200).send({
    code: 'success',
    data: {
      [Model.modelName.toLowerCase()]: doc,
    },
  });
};

export const deleteOne = (Model) => async (request, reply) => {
  const doc = await Model.findByIdAndDelete(request.params.id);
  if (!doc) throw new OperationError('No document found with that ID', 404);

  reply.code(204).send({
    code: 'success',
    data: null,
  });
};
