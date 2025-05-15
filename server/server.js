import Fastify from 'fastify';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import markerRoutes from './routes/markerRoute.js';
import errorController from './controllers/errorController.js';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export const fastify = Fastify({
  logger: true,
});
dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV === 'development') {
  fastify.register(morgan('dev'));
}
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

fastify.register(markerRoutes, { prefix: '/api/v1' });

fastify.setErrorHandler(errorController);

await mongoose.connect(DB).then(() => console.log('DB connection successful!'));
try {
  fastify.listen({ port: port, host: '0.0.0.0' });
  console.log(`Server running on port ${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  fastify.close(() => {
    process.exit(1);
  });
});
