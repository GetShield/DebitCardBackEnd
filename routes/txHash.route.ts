import authorize from '../middlewares/authorize';
import express from 'express';
const router = express.Router();

import txHashController from '../controllers/txHash.controller';
import logRequest from '../middlewares/logRequest';
router.get('/', authorize, logRequest, txHashController.getAll);
router.get(
  '/get-by-blockchain',
  authorize,
  logRequest,
  txHashController.getByBlockchain
);

router.delete(
  '/delete-by-blockchain',
  authorize,
  logRequest,
  txHashController.deleteByBlockchain
);

export default router;
