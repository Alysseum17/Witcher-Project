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
    status: 'success',
    results: docs.length,
    data: {
      [Model.modelName.toLowerCase()]: docs,
    },
  });
};

export const getOne = (Model) => async (request, reply) => {
  const id = request.params.id.includes('\n')
    ? request.params.id.replace('\n', '')
    : request.params.id;
  const doc = await Model.findById(id);
  if (!doc) throw new OperationError('No document found with that ID', 404);
  reply.code(200).send({
    status: 'success',
    data: {
      [Model.modelName.toLowerCase()]: doc,
    },
  });
};

export const createOne = (Model) => async (request, reply) => {
  const newDoc = await Model.create(request.body);

  reply.code(201).send({
    status: 'success',
    data: {
      [Model.modelName.toLowerCase()]: newDoc,
    },
  });
};

export const updateOne = (Model) => async (request, reply) => {
  const id = request.params.id.includes('\n')
    ? request.params.id.replace('\n', '')
    : request.params.id;
  const doc = await Model.findByIdAndUpdate(id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new OperationError('No document found with that ID', 404);

  reply.code(200).send({
    status: 'success',
    data: {
      [Model.modelName.toLowerCase()]: doc,
    },
  });
};

export const deleteOne = (Model) => async (request, reply) => {
  const id = request.params.id.includes('\n')
    ? request.params.id.replace('\n', '')
    : request.params.id;
  const doc = await Model.findByIdAndDelete(id);
  if (!doc) throw new OperationError('No document found with that ID', 404);

  reply.code(204).send({
    status: 'success',
    data: null,
  });
};
