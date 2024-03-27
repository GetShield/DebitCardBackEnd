import authorize from '../middlewares/authorize';
import logRequest from '../middlewares/logRequest';

import express from 'express';
const router = express.Router();

import limitsController from '../controllers/limits.controller';

router.get('/', authorize, logRequest, limitsController.allLimits);
router.get(
  '/get-by-current-user',
  authorize,
  logRequest,
  limitsController.getByCurrentUser
);
router.get('/:limitId', authorize, logRequest, limitsController.getLimitById);
router.patch('/:limitId', authorize, logRequest, limitsController.updateLimit);

export default router;
