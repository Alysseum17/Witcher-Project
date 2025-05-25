import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

export default async function userRoutes(fastify, _opts) {
  fastify.post('/signup', authController.signup);
  fastify.post('/login', authController.login);
  fastify.post('/forgotPassword', authController.forgotPassword);
  fastify.patch('/resetPassword/:token', authController.resetPassword);

  fastify.patch(
    '/updateMyPassword',
    { preHandler: authController.protect },
    authController.updatePassword,
  );

  fastify.get(
    '/me',
    { preHandler: [authController.protect, userController.getMe] },
    userController.getUser,
  );

  fastify.patch(
    '/updateMe',
    { preHandler: authController.protect },
    userController.updateMe,
  );
  fastify.delete(
    '/deleteMe',
    { preHandler: authController.protect },
    userController.deleteMe,
  );

  fastify.get(
    '/',
    {
      preHandler: [
        authController.protect,
        authController.restrictTo(['admin']),
      ],
    },
    userController.getAllUsers,
  );
  fastify.post(
    '/',
    {
      preHandler: [
        authController.protect,
        authController.restrictTo(['admin']),
      ],
    },
    userController.createUser,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [
        authController.protect,
        authController.restrictTo(['admin']),
      ],
    },
    userController.getUser,
  );
  fastify.patch(
    '/:id',
    {
      preHandler: [
        authController.protect,
        authController.restrictTo(['admin']),
      ],
    },
    userController.updateUser,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: [
        authController.protect,
        authController.restrictTo(['admin']),
      ],
    },
    userController.deleteUser,
  );
  fastify.get(
    '/auth/ping',
    {
      preHandler: authController.protect,
    },
    async (_req, reply) => {
      reply.code(204).send();
    },
  );
}
