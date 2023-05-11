'use strict'

const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')

const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
const User = require('./models/user')
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')

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
app.use('/images', express.static(path.join(__dirname, 'images')))
app.set('view engine', 'ejs')

// File storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const imageFileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
        cb(null, true)
    else 
        cb(null, false)
}
app.use(multer({storage: fileStorage, fileFilter: imageFileFilter}).single('image'))

const MongoStore = new MongoDBStore({
    uri: `${process.env.MONGO_URL}`,
    collection: 'sessions'
})

app.use(session(
    {secret: 'my secret', resave: false, saveUninitialized: false, store: MongoStore}))
app.use(flash())

const adminRoutes = require('./routes/admin.js')
const shopRoutes = require('./routes/shop.js')
const errorController = require('./controllers/error')
const authRoutes = require('./routes/auth')
const csurfProtection = csrf()

app.use(csurfProtection)
app.use((req, res, next) => {
    if(!req.session.user) return next()
    User
        .findById(req.session.user._id)
        .then(user => {
            if(!user) next()
            req.user = user
            next()
        })
        .catch(err =>  {
            //This is will not do anything. Errors should be thrown outside async (then) block to have them caught by error request handler
            // throw new Error(err)
            // This will work
            next(new Error(err))
        })
})

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

mongoose
    .connect(`${process.env.MONGO_URL}`)
    .then(result => {
        app.listen(process.env.Port || 3000)
    })
    .catch(err => {
        console.log(err)
    })

app.use('/500', errorController.get500)
app.use(errorController.get404)
// app.use((error, req, res, next) => {
//     // res.status(error.httpStatusCode(500).render()
//     res.redirect('/500')
// })
