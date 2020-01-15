const express = require("express");
const userController = require('../controllers/user')
const isAuth = require('../middleware/auth')

const router = express.Router();

router.get('/status', isAuth, userController.getStatus)

router.put('/status', isAuth, userController.updateStatus)

module.exports = router
