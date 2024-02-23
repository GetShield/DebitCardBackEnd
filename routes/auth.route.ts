const express = require('express');
const router = express.Router();
import logRequest from '../middlewares/logRequest';

import authController from '../controllers/auth.controller';

router.post('/login', logRequest, authController.login);
router.post('/register', logRequest, authController.register);

export default router;
