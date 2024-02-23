import authorize from '../middlewares/authorize';

import express from 'express';
const router = express.Router();

import BalanceController from '../controllers/balance.controller';
import logRequest from '../middlewares/logRequest';

router.get('/', authorize, logRequest, BalanceController.getAll);
router.put('/update', authorize, logRequest, BalanceController.update);
router.get(
  '/get-by-wallet-and-blockchain',
  authorize,
  logRequest,
  BalanceController.getByWalletAndBlockchain
);
router.get(
  '/get-by-user/:userId',
  authorize,
  logRequest,
  BalanceController.getByUser
);
router.get(
  '/get-by-current-user',
  authorize,
  logRequest,
  BalanceController.getByCurrentUser
);

export default router;
