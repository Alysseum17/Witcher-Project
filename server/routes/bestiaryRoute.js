import { createHTML } from '../controllers/bestiaryController.js';

export default async function (fastify, _opts) {
  fastify.post('/bestiary', createHTML);
}
