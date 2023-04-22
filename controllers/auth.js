const User = require('../models/user')
const bcrypt = require('bcryptjs')
const Mailjet = require('node-mailjet')
const crypto = require('crypto')
const { validationResult } = require('express-validator')

const P_APIKEY = 'b410e3a463611f3f309c8780d23e3a74'
const S_APIKEY = '9cbfb22d92691595328e6c8d76637472'
const senderMail = 'shivu.a.1945@gmail.com'

const mailjet = Mailjet.apiConnect(P_APIKEY, S_APIKEY)

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        isAuthenticated: false,
        errorMessage: req.flash('error')[0],
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array()[0].msg)
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: errors.array()
        })
    }
    // User.findOne({ email: email }).then(dbuser => {
    //     if (dbuser) {
    //         req.flash('error', 'Email already taken !!')
    //         return res.redirect('/signup')
    //     }
    bcrypt.hash(password, 12).then(hashpass => {
        const user = new User({
            email: email,
            password: hashpass,
            cart: { items: [] }
        })
        return user.save()
    })
        .then(result => {
            res.redirect('/login')
            return mailjet
                .post("send", { 'version': 'v3.1' })
                .request({
                    "Messages": [{
                        "From": {
                            "Email": senderMail,
                            "Name": "Sashop"
                        },
                        "To": [{
                            "Email": email
                        }],
                        "Subject": "Signin in",
                        "TextPart": "Thanks for signing in"
                    }]
                })
        }).catch(err => console.log(err))
}

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie'))
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login Page',
        isAuthenticated: false,
        errorMessage: null,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login Page',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }
    User.findOne({ email: email }).then(user => {
        if (!user) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login Page',
                isAuthenticated: false,
                errorMessage: "Account with this email does not exists!! Please enter a valid email !!",
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: [{ path: 'email'}, {path: 'password' }]
            })
        }
        bcrypt.compare(password, user.password).then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true
                req.session.user = user
                return req.session.save(err => {
                    // console.log(err)
                    res.redirect('/')
                })
            }
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login Page',
                isAuthenticated: false,
                errorMessage: "Invalid Password",
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: [{ path: 'email' }, { path: 'password' }]
            })
        }).catch(err => {
            console.log(err)
            res.redirect('/login')
        })
    })
        .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        // console.log(err)
        res.redirect('/')
    })
}

exports.getReset = (req, res, next) => {
    res.render('auth/reset-password.ejs', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: req.flash('error')
    })
}

exports.postReset = (req, res, next) => {
    const email = req.body.email
    crypto.randomBytes(32, (err, buffer) => {
        if (err)
            return res.redirect('/reset')
        const token = buffer.toString('hex')
        User.findOne({ email: email }).then(user => {
            if (!user) {
                req.flash('error', 'No account associated with the provided email !!')
                return res.redirect('/reset')
            }
            user.resetToken = token
            user.resetTokenExpiration = Date.now() + (1000 * 3600)
            return user.save().then(result => {
                res.redirect('/')
                mailjet.post("send", { 'version': 'v3.1' }).request({
                    "Messages": [{
                        "From": { "Email": senderMail, "Name": "Sashop" },
                        "To": [{ "Email": email }],
                        "Subject": "Password Reset",
                        "TextPart": "You've requested a password reset",
                        "HTMLPart": `
                            <p> You requested a password Reset </p> 
                            <p> Click <a href="http://localhost:3000/reset/${token}"> here </a>  to reset Password</p>
                            <h6> This link will be active for an hour only </h6> 
                            `
                    }]
                })
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
        if (user) {
            res.render('auth/new-password.ejs', {
                pageTitle: 'New Password',
                path: '/new-password',
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token
            })
        } else {
            res.redirect('/')
        }
    }).catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
    const password = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser
    User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (user) {
                resetUser = user
                return bcrypt.hash(password, 12)
            }
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            resetUser.save()
        })
        .then(result => {
            return res.redirect('/login')
        })
        .catch(err => console.log(err))
}