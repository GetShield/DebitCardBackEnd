import authorize from '../middlewares/authorize';

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

router.get('/', authorize, userController.allUsers);
router.get('/:id', authorize, userController.getUserById);
router.post('/', authorize, userController.createUser);
router.put('/:id', authorize, userController.updateUserById);

module.exports = router;
