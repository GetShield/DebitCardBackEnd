import authorize from '../middlewares/authorize';
import logRequest from '../middlewares/logRequest';

const express = require('express');
const router = express.Router();

import userController from '../controllers/user.controller';

router.get('/', authorize, logRequest, userController.allUsers);
router.get('/:id', authorize, logRequest, userController.getUserById);
router.post('/', authorize, logRequest, userController.createUser);
router.put('/:id', authorize, logRequest, userController.updateUserById);

export default router;
