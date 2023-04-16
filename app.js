'use strict'

const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const mongoose = require('mongoose')
const User = require('./models/user')

/**
 * 1. Create app
 * 2. Attach BodyParser
 * 3. Set render engine for templates
 * 4. Set up path for static files like views
 * 5. Attach routes
 * 6. Create associations if any exist
 * 7. Set up DB
 */
const app = express()
app.use(bodyparser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')

const MongoStore = new MongoDBStore({
    uri: 'mongodb+srv://ShopOwner:lXLaEMaZYf7LyKyo@cluster0.8dtrmbc.mongodb.net/shop',
    collection: 'sessions'
})

app.use(session(
    {secret: 'my secret', resave: false, saveUninitialized: false, store: MongoStore}))

const adminRoutes = require('./routes/admin.js')
const shopRoutes = require('./routes/shop.js')
const errorController = require('./controllers/error')
const authRoutes = require('./routes/auth')

//Attach a dummy user for now
app.use((req, res, next) => {
    if(!req.session.user) return next()
    User
        .findById(req.session.user._id)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

mongoose
    .connect('mongodb+srv://ShopOwner:lXLaEMaZYf7LyKyo@cluster0.8dtrmbc.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        User.findOne().then(user => {
            if(!user) {
                const user = new User({
                    name: 'Nihal',
                    email: 'nihal@g.com',
                    cart: {
                        items: []
                    }
                })
                user.save() 
            }
        })
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })

app.use(errorController.get404)
