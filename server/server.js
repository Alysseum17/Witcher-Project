import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import markerRoutes from './routes/markerRoute.js';
import userRoutes from './routes/userRoute.js';
import errorController from './controllers/errorController.js';
import bestiaryRoute from './routes/bestiaryRoute.js';

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
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
fastify.setErrorHandler(errorController);
await fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    if (!origin) {
      return cb(null, true);
    }
    const allowed = ['http://localhost:5500', 'http://127.0.0.1:5500'];
    if (allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
await fastify.register(fastifyCookie, {
  secret: process.env.JWT_SECRET,
  parseOptions: {},
});
fastify.register(markerRoutes, { prefix: '/api/v1/markers' });
fastify.register(userRoutes, { prefix: '/api/v1/users' });

await fastify.register(fastifyFormbody);
fastify.register(bestiaryRoute, { prefix: '/api/v1' });

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
