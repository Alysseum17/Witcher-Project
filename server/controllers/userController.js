import User from '../models/userModel.js';
import OperationError from '../utils/operationError.js';
import * as crudFactory from '../utils/crudFactory.js';
import filterObj from '../utils/filterObj.js';

export const getAllUsers = crudFactory.getAll(User);
export const getUser = crudFactory.getOne(User);
export const updateUser = crudFactory.updateOne(User);
export const deleteUser = crudFactory.deleteOne(User);
export const createUser = async (_request, reply) => {
  reply.code(500).send({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead.',
  });
};

export const getMe = (request, _reply, done) => {
  request.params.id = request.user.id;
  done();
};

export const updateMe = async (request, reply) => {
  const id = request.params.id.includes('\n')
    ? request.params.id.replace('\n', '')
    : request.params.id;
  if (request.body.password || request.body.passwordConfirm) {
    throw new OperationError(
      'This route is not for password updates. Please use /updateMyPassword instead.',
    );
  }
  let filteredBody = {};
  if (!request.body.name && !request.body.email) {
    throw new OperationError(
      'Please provide at least one field to update.',
      400,
    );
  } else if (request.body.name && request.body.email) {
    filteredBody = filterObj(request.body, 'name', 'email');
  } else if (request.body.name) {
    filteredBody = filterObj(request.body, 'name');
  } else {
    filteredBody = filterObj(request.body, 'email');
  }

  const updatedUser = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true,
  });

  reply.code(200).send({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};

export const deleteMe = async (request, reply) => {
  const id = request.params.id.includes('\n')
    ? request.params.id.replace('\n', '')
    : request.params.id;
  await User.findByIdAndDelete(id);

  reply.code(204).send({
    status: 'success',
    data: null,
  });
};
