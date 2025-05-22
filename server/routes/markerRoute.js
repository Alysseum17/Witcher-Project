import markerController from '../controllers/markerController.js';
import authController from '../controllers/authController.js';

export default async function markerRoutes(fastify, _opts) {
  fastify.get('/', markerController.getAllMarkers);
  fastify.post('/', markerController.createMarker);
  fastify.get('/:id', markerController.getMarker);
  fastify.patch('/:id', markerController.updateMarker);
  fastify.delete('/:id', markerController.deleteMarker);
  fastify.get('/public', markerController.getPublicMarkers);
  fastify.get(
    '/own',
    { preHandler: authController.protect },
    markerController.getOwnMarkers,
  );
  fastify.post(
    '/own',
    { preHandler: authController.protect },
    markerController.createOwnMarker,
  );
}
