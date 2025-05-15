import {
  getAllMarkers,
  getMarker,
  createMarker,
  updateMarker,
  deleteMarker,
} from '../controllers/markerController.js';

export default async function markerRoutes(fastify, _opts) {
  fastify.get('/markers', getAllMarkers);
  fastify.post('/markers', createMarker);
  fastify.get('/markers/:id', getMarker);
  fastify.patch('/markers/:id', updateMarker);
  fastify.delete('/markers/:id', deleteMarker);
}
