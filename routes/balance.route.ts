import authorize from '../middlewares/authorize';

import express from 'express';
const router = express.Router();

import BalanceController from '../controllers/balance.controller';


router.get('/', authorize, BalanceController.getAll);
router.post('/create', authorize, BalanceController.create);
router.get('/get-by-wallet-and-blockchain', authorize, BalanceController.getByWalletAndBlockchain);


export default router;
