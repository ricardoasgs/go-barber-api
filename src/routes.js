import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

routes.get('/', async (req, res) => {
  res.json({ status: 'OK' });
});

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

export default routes;
