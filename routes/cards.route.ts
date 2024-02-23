import authorize from '../middlewares/authorize';

const express = require('express');
const router = express.Router();

import cardController from '../controllers/cards.controller';
import logRequest from '../middlewares/logRequest';

router.get('/', authorize, logRequest, cardController.findCardsFromAirtable);
router.get('/ramp', authorize, logRequest, cardController.findCardsFromRamp);

export default router;
