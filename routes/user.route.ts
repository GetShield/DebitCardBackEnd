import authorize from '../middlewares/authorize';

const express = require('express');
const router = express.Router();

import userController from '../controllers/user.controller';

router.get('/', authorize, userController.allUsers);
router.get('/:id', authorize, userController.getUserById);
router.post('/', authorize, userController.createUser);
router.put('/:id', authorize, userController.updateUserById);

export default router;
