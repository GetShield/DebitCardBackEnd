const express = require('express')
const router = express.Router()

const userController = require('../controllers/user.controller')

router.get('/', userController.allUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUserById);

module.exports = router;