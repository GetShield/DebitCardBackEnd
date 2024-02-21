const express = require('express');
const router = express.Router();

import walletController from '../controllers/wallet.controller';

router.post('/create', walletController.create);
router.get('/price', walletController.getTokenPrice);
router.get('/all', walletController.getAll);
router.get('/get-by-blockchain/:blockchain', walletController.getWalletByBlockchain);
router.get('/:address', walletController.getWalletByAddress);
router.post('/', walletController.createWallet);
router.put('/:address', walletController.updateBalanceByAddress);

export default router;
