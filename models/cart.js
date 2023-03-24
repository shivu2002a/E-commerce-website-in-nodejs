const path = require('path')
const fs = require('fs')

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json')

module.exports = class Cart {

    // static addProduct(id, productPrice) {
    //     //Fetch prev contents
    //     fs.readFile(p, (err, fileContent) => {
    //         let cart = {products: [], totalPrice: 0}
    //         if (!err) {
    //             // console.log(fileContent.buffer)
    //             cart = JSON.parse(fileContent)
    //         }

    //         //Analyze
    //         const existProdIndex = cart.products.findIndex(product => product.id === id)
    //         const existProd = cart.products[existProdIndex]
    //         console.log(existProd, existProdIndex)
    //         let updatedProd;
    //         //Add product or increaser quantity
    //         if (existProd) {
    //             updatedProd = { ...existProd }
    //             updatedProd.qty += 1
    //             // cart.products = [...cart.products]
    //             cart.products[existProdIndex] = updatedProd
    //         } else {
    //             updatedProd = {
    //                 id: id,
    //                 qty: 1
    //             }
    //             // cart.products = [...cart.products, updatedProd]
    //             cart.products.push(updatedProd)

    //         }
    //         cart.totalPrice += +(productPrice)
    //         fs.writeFile(p, JSON.stringify(cart), err => console.log(err))
    //     })
    // }

    static addProduct(id, productPrice) {
        // Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = { 
                products: [], 
                totalPrice: 0 
            }
            
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            let updatedProduct;
            console.log(cart.products, cart.totalPrice)
            // If nothing in the file, initialize the object fields (bcz they'll be undefined initially)
            if (!cart.products) {
                cart.products = []
                cart.totalPrice = 0
            }
            // Analyze the cart => Find existing product
            const existingProductIndex = cart.products.findIndex(
                prod => prod.id === id
            );
            const existingProduct = cart.products[existingProductIndex];
            // Add new product/ increase quantity
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct]
            }
            cart.totalPrice += Number(productPrice);
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }

    static deleteProduct(id, price) {
        fs.readFile(p, (err, fileContent) => {
            if(err) {
                return
            }
            const updatedCart = { ...JSON.parse(fileContent) }
            console.log(updatedCart)
            const prod = updatedCart.products.find(prod => prod.id === id )
            if(!prod)
                return 
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id) 
            console.log(price)
            updatedCart.totalPrice -= (price*prod.qty)  
            fs.writeFile(p, JSON.stringify(updatedCart), (err) => console.log(err))
        })
    }

    static getCartItems(cb){
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent)
            if(err) 
                return cb(null)
            else
                return cb(cart)
        })
    }
}