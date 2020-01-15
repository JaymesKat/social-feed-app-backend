const express = require("express");
const { body } = require("express-validator");
const authController = require('../controllers/auth')
const User = require('../models/user')
const userController = require('../controllers/user')
const isAuth = require('../middleware/auth')

const router = express.Router();

router.put('/signup', [
    body("email")
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if(userDoc){
                    return Promise.reject('Email address already exists')
                }
            })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body("name")
        .trim()
        .not()
        .isEmpty(),
], authController.signup);

router.post('/login', authController.login)

router.get('/status', isAuth, userController.getStatus)

router.put('/status', isAuth, userController.updateStatus)

module.exports = router
