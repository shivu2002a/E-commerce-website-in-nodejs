const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie'))
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login Page',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    User.findById('643a2aff7c704cf1b2e435df').then(user => {
        // res.setHeader('Set-Cookie', 'loggedIn = true')
        req.session.isLoggedIn = true
        req.session.user = user
        req.session.save(err => {
            console.log(err)
            res.redirect('/')
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