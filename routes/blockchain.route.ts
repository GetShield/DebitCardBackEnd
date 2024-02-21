const express = require('express');
const router = express.Router();

import blockchainController from '../controllers/blockchain.controller';

router.get('/', blockchainController.getAll);

export default router;
