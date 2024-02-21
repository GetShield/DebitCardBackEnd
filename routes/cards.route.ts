import authorize from '../middlewares/authorize';

const express = require('express');
const router = express.Router();

const cardController = require('../controllers/cards.controller');

router.get('/', authorize, cardController.findCardsFromAirtable);
router.get('/ramp', authorize, cardController.findCardsFromRamp);

export default  router;
