'use strict'

// const http = require('http')
const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const db = require('./utils/database')

const app = express()
app.use(bodyparser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

//Rendering engine
// app.set('view engine', 'pug')
// app.set('views', 'views')
app.set('view engine', 'ejs')


const adminRoutes = require('./routes/admin.js')
const shopRoutes = require('./routes/shop.js')
const errorController = require('./controllers/error')

app.use('/admin', adminRoutes)
app.use(shopRoutes)

//MYSQL Query
db.execute('Select * from products')
.then(result => {
    console.log(result[0])
})
.catch(err => {
    console.log(err)
})

// app.use((req, res, next) => {
//     res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
// })

app.use(errorController.get404)

// const server = http.createServer(app)
// server.listen(3000)
// Above two lines
app.listen(3000)