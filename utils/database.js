// const mysql = require('mysql2')

// const pool = mysql.createPool({
//     host: 'localhost',
//     database: 'onlineshop',
//     password: 'localhost3306',
//     user: 'root'
// })

// module.exports = pool.promise()

//Using Sequelize
const Sequelize = require('sequelize')
const sequelize = new Sequelize('onlineshop', 'root', 'localhost3306', { dialect: 'mysql', host: 'localhost' })

module.exports = sequelize