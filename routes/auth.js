const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const User = require('../models/user')
const { check, body } = require('express-validator')

router.get('/signup', authController.getSignup)
router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .trim()
        .custom((value, { req }) => {
            // if (value === 'test@test.com') {
            //     throw new Error('This email is forbidden !!')
            // }
            // return true
            return User.findOne({ email: value }).then(dbuser => {
                if (dbuser) {
                    return Promise.reject('Email already exists!! Please pick a different one !!')
                }
            })
        }),

    body('password', 'Enter a password with only nums and chars and at least 5 chars long')
        .isLength({ min: 5, max: 15 })
        .isAlphanumeric()
        .trim(),

    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match !!')
        }
        return true;
    })
    .trim()
],
    authController.postSignup)

router.get('/login', authController.getLogin)
router.post('/login',
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .trim()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(dbuser => {
                if (!dbuser) {
                    return Promise.reject('Account with this email does not exists!! Please enter a valid email !!')
                }
            })
        }),
    authController.postLogin)

router.post('/logout', authController.postLogout)

router.get('/reset', authController.getReset)
router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password', authController.postNewPassword)

module.exports = router