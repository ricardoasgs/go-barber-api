import { Router } from 'express';
import UserController from './app/controllers/UserController';

const routes = new Router();

routes.get('/', async (req, res) => {
  res.json({ status: 'OK' });
});

routes.post('/users', UserController.store);

export default routes;
