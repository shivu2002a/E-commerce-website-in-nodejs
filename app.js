'use strict'

const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const sequelize = require('./utils/database')

//Models
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

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

//Rendering engine
// app.set('view engine', 'pug')
// app.set('views', 'views')
app.set('view engine', 'ejs')


const adminRoutes = require('./routes/admin.js')
const shopRoutes = require('./routes/shop.js')
const errorController = require('./controllers/error')

//Attach a dummy user
app.use((req, res, next) => {
    User
        .findByPk(1)
        .then(result => {
            // console.log('From app.js', result)
            req.user = result
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(errorController.get404)


//MYSQL Query
/*
db.execute('Select * from products')
.then(result => {
    console.log(result[0])
})
.catch(err => {
    console.log(err)
})
 */

// app.use((req, res, next) => {
//     res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
// })

Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
})
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)

Cart.belongsToMany(Product, {through: CartItem})
Product.belongsToMany(Cart, {through: CartItem})

Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, {through: OrderItem})
Product.belongsToMany(Order, {through: OrderItem}) 


sequelize
    .sync(/*{ force: true }*/)
    .then(result => {
        return User.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return User.create({ name: 'Nihal', email: 'ng@gmail.com' })
        }
        return user
    })
    // .then(user => {
    //     return user.createCart()
    // })
    .then(cart => {
        console.log(cart)
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })

// const server = http.createServer(app)
// server.listen(3000)
// Above two lines -->
// app.listen(3000)