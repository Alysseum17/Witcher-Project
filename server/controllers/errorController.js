import OperationError from '../utils/operationError.js';

const handleCastErrorDB = (err) =>
  new OperationError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : '';
  return new OperationError(`Duplicate field value: ${value}.`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new OperationError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const sendErrorDev = (err, reply) => {
  reply.code(err.statusCode).send({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, reply) => {
  if (err.isOperational) {
    reply.code(err.statusCode).send({
      status: err.status,
      message: err.message,
    });
  } else {
    reply.code(500).send({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export default (err, request, reply) => {
  let error = Object.create(err);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(error, reply);
  }

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  sendErrorProd(error, reply);
};
