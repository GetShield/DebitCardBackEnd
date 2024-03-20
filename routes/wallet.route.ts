import authorize from '../middlewares/authorize';
import logRequest from '../middlewares/logRequest';

import express from 'express';
const router = express.Router();

import walletController from '../controllers/wallet.controller';

router.post('/create', authorize, logRequest, walletController.create);
router.put('/update', authorize, logRequest, walletController.updateWallet);
router.post('/create-for-current-user', authorize, walletController.create);
router.get('/price', authorize, logRequest, walletController.getTokenPrice);
router.get(
  '/historical-price',
  authorize,
  logRequest,
  walletController.getHistoricalPrice
);

router.get('/shield', authorize, logRequest, walletController.shield);

router.get('/', authorize, logRequest, walletController.getAll);
router.get(
  '/get-by-blockchain/:blockchain',
  authorize,
  walletController.getWalletByBlockchain
);
router.get(
  '/get-by-user/:userId',
  authorize,
  logRequest,
  walletController.getWalletByUser
);
router.get(
  '/get-by-current-user',
  authorize,
  logRequest,
  walletController.getWalletByCurrentUser
);

router.get(
  '/:address',
  authorize,
  logRequest,
  walletController.getWalletByAddress
);
router.put(
  '/:address',
  authorize,
  logRequest,
  walletController.updateBalanceByAddress
);

export default router;
