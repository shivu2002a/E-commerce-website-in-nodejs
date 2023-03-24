const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    database: 'onlineshop',
    password: 'localhost3306',
    user: 'root'
})

module.exports = pool.promise()