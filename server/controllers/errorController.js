import OperationError from '../utils/operationError.js';

const handleCastErrorDB = (err) =>
  new OperationError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) => {
  const key = err.keyValue || err.cause?.keyValue;
  const [field, value] = Object.entries(key)[0];
  return new OperationError('Duplicate field value', 400, {
    [field]: `${field} "${value}" already exists`,
  });
};

const handleValidationErrorDB = (err) => {
  const details = {};
  Object.values(err.errors).forEach((el) => {
    details[el.path] = el.message;
  });
  return new OperationError('Validation error', 400, details);
};

const sendErrorDev = (err, reply) => {
  reply.code(err.statusCode).send({
    status: err.status,
    error: err,
    message: err.message,
    errors: err.details || null,
    stack: err.stack,
  });
};

const sendErrorProd = (err, reply) => {
  if (err.isOperational) {
    reply.code(err.statusCode).send({
      status: err.status,
      message: err.message,
      errors: err.details || null,
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
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  const dupCode = error.code || error.cause?.code;
  if (dupCode == 11000) error = handleDuplicateFieldsDB(error);
  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(error, reply);
  }

  if (error.name === 'CastError') error = handleCastErrorDB(error);

  sendErrorProd(error, reply);
};
