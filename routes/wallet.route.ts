const express = require('express');
const router = express.Router();

import walletController from '../controllers/wallet.controller';

router.get('/price', walletController.getTokenPrice);
router.get('/:address', walletController.getWalletByAddress);
router.post('/', walletController.createWallet);
router.put('/:address', walletController.updateBalanceByAddress);

export default router;
