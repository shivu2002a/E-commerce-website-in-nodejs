// const mysql = require('mysql2')

// const pool = mysql.createPool({
//     host: 'localhost',
//     database: 'onlineshop',
//     password: 'localhost3306',
//     user: 'root'
// })

// module.exports = pool.promise()

//Using Sequelize
// const Sequelize = require('sequelize')
// const sequelize = new Sequelize('onlineshop', 'root', 'localhost3306', { dialect: 'mysql', host: 'localhost' })

// module.exports = sequelize

/* 
    MONGOOSE EFFECT

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let db;
const mongoConnect = (callback) => {
    MongoClient
    .connect('mongodb+srv://ShopOwner:lXLaEMaZYf7LyKyo@cluster0.8dtrmbc.mongodb.net/?retryWrites=true&w=majority')
    .then(client => {
        console.log("Connected!!")
        db = client.db()
        callback()
    })
    .catch(err => {
        console.log(err)
        throw err
    })
}

const getDb = () => {
    if(db)
    return db
    throw 'No DB Found !!'
}

module.exports.mongoConnect = mongoConnect
module.exports.getDb = getDb
*/
