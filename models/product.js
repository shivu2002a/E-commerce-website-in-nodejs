// const fs = require('fs')
// const path = require('path')

const Cart = require('./cart')
const db = require('../utils/database')

// const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')

// const getProductsFromFile = (cb) => {
// fs.readFile(p, (err, fileContent) => {
//     //If no error, cread contents of file
//         if (!err) {
//             return cb(JSON.parse(fileContent))
//         }
//         return cb([])
//     })
// }

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.title = title
        this.id = id
        this.imageUrl= imageUrl
        this.description = description
        this.price = price
    }

    save() {
        // The func must be arrow to refer to the obj instance, else it'll loose context
        //If no error, cread contents of file
        /*
        getProductsFromFile(products => {
            if(this.id) {
                const existingprodInd = products.findIndex(p => p.id === this.id)
                products[existingprodInd] = this
            }else {
                this.id = Math.random().toString()
                products.push(this)
            }
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err)
            })
        })
        */

        return db.execute('INSERT INTO PRODUCTS (title, price, description, imageUrl) VALUES (?, ?, ?, ?)', [this.title, this.price, this.description, this.imageUrl])
    }

    static deleteById(id){
        /*
        getProductsFromFile(prods => {
            const prod = prods.find(p => p.id === id)
            const updatedProd = prods.filter(prod => prod.id !== id)
            fs.writeFile(p, JSON.stringify(updatedProd), err => {
                if(!err){
                    Cart.deleteProduct(id, prod.price)
                }
            })
        })
        */
    }

    static fetchAll() {
        // return getProductsFromFile(cb)
        return db.execute('SELECT * FROM PRODUCTS;')
    }

    static findById(id) {
        // getProductsFromFile(prods => {
        //     const prod = prods.find(p => p.id == id)
        //     cb(prod)
        // })
        return db.execute('SELECT * FROM PRODUCTS where id = ?', [id])
    }
}