const Product = require('../models/product')
const Cart = require('../models/cart')
const Order = require('../models/order')
const OrderItem = require('../models/order-item')


exports.getIndex = (req, res, next) => {
    Product.findAll().then((rows) => {
        res.render('shop/index.ejs', {
            pageTitle: 'Shop',
            path: '/',
            products: rows
        })
    })
        .catch(err => {
            console.log(err)
        })
}

exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            products: products,
            pageTitle: 'All Products',
            path: '/products'
        })
    })
        .catch(err => console.log(err))
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId
    Product.findAll({ where: { id: id } }).then(product => {
        console.log(product)
        res.render('shop/product-detail.ejs', {
            product: product[0],
            pageTitle: product[0].title,
            path: '/product'
        })
    })

    /**
     Using findByPk() gives only one result
     Product.findByPk(id).then(product => {
         console.log(product)
         res.render("shop/product-detail", {
             product: product,
             pageTitle: product['title'],
             path: '/products'
         })
     })
     .catch(err => console.log(err)) 
     */
}

exports.postOrder = (req, res, next) => {
    let fetchedCart
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart
            return cart.getProducts()
        })
        .then(products => {
            // console.log(products)
            return req.user
            .createOrder()
            .then(order => {
                return order.addProducts(products.map(prod => {
                    prod.orderItem = {
                        quantity: prod.cartItem.quantity
                    }
                    return prod
                }))
            })
            .catch(err => console.log(err))
        })
        .then((result) => {
            return fetchedCart.setProducts(null)
        })
        .then(result => {
            res.redirect('/orders')
        })
        .catch(err => console.log(err))

}

exports.getOrders = (req, res, next) => {
    req.user
    .getOrders({include: ['products']})
    .then(orders => {
        res.render('shop/orders.ejs', {
            orders: orders,
            path: '/orders',
            pageTitle: 'Orders'
        })
    })
    .catch(err => console.log(err))
    
}

exports.getCart = (req, res, next) => {
    // Cart.getCartItems(cart => {
    //     Product.fetchAll(products => {
    //         const cartProducts = []
    //         for (let product of products){
    //             const cartprod = cart.products.find(prod => prod.id === product.id)
    //             // console.log(product)
    //             if(cartprod)
    //                 cartProducts.push({
    //                     productData: product,
    //                     qty: cartprod.qty
    //                 })
    //         }
    //         // console.log(cartProducts)
    //         res.render('shop/cart.ejs', {
    //             pageTitle: 'Your Cart',
    //             path: '/cart',
    //             products: cartProducts 
    //         })
    //     })
    // })
    req.user
        .getCart()
        .then(cart => {
            // console.log(cart)
            return cart
                .getProducts()
                .then(cartProducts => {
                    res.render('shop/cart.ejs', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products: cartProducts
                    })
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
    const prodID = req.body.productId
    // Product.findById(ID, prod => {
    //     Cart.addProduct(ID, prod.price)
    // })
    let fetchedCart
    let newQuantity = 1
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart
            return cart.getProducts({ where: { id: prodID } })
        })
        .then(prods => {
            let prod
            if (prods.length > 0) {
                prod = prods[0]
            }
            if (prod) {
                newQuantity += prod.cartItem.quantity
                return prod
            }
            return Product.findByPk(prodID)
                .catch(err => console.log(err))
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: {
                    quantity: newQuantity
                }
            })
        })
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err))
}

exports.deleteCartItem = (req, res, next) => {
    const prodId = req.body.productId
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: prodId } })
        })
        .then(prods => {
            const prod = prods[0]
            return prod.cartItem.destroy()
        })
        .then(result => {
            return res.redirect('/cart')
        })
        .catch(err => console.log(err))
    // Product.findById(id, prod => {
    //     Cart.deleteProduct(id, prod.price)
    //     res.redirect('/cart')
    // })
}

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout.ejs', {
        pageTitle: 'Checkout',
        path: '/checkout',

    })
}