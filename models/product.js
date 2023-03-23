const fs = require('fs')
const path = require('path')

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')

const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, fileContent) => {
        //If no error, cread contents of file
        if (!err) {
            return cb(JSON.parse(fileContent))
        }
        return cb([])
    })
}

module.exports = class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title
        this.imageUrl= imageUrl
        this.description = description
        this.price = price
    }

    save() {
        // The func must be arrow to refer to the obj instance, else it'll loose context
        //If no error, cread contents of file
        this.id = Math.random().toString()
        getProductsFromFile(products => {
            products.push(this)
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err)
            })
        })
    }

    static fetchAll(cb) {
        return getProductsFromFile(cb)
    }

    static findById(id, cb) {
        getProductsFromFile(prods => {
            const prod = prods.find(p => p.id == id)
            cb(prod)
        })

    }
}