const Product = require('../models/product')

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products => {
        res.render('shop/index.ejs', {
            pageTitle: 'Shop',
            path: '/index',
            products: products
        })
    }))
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            products: products,
            pageTitle: 'All Products',
            path: '/products'
        })
    })
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders.ejs', {
        path: '/orders',
        pageTitle: 'Orders'
    })
}
exports.getCart = (req, res, next) => {
    res.render('shop/cart.ejs', {
        pageTitle: 'Your Cart',
        path: '/cart'
    })
}

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout.ejs', {
        pageTitle: 'Checkout',
        path: '/checkout',

    })
}