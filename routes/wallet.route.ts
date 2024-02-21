import authorize from '../middlewares/authorize';

import express from 'express';
const router = express.Router();

import walletController from '../controllers/wallet.controller';

router.post('/create', authorize, walletController.create);
router.get('/price', authorize, walletController.getTokenPrice);
router.get('/', authorize, walletController.getAll);
router.get('/get-by-blockchain/:blockchain', authorize, walletController.getWalletByBlockchain);
router.get('/get-by-user/:userId', authorize, walletController.getWalletByUser);
router.get('/:address', authorize, walletController.getWalletByAddress);
router.put('/:address', authorize, walletController.updateBalanceByAddress);

export default router;
