const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products => {
        res.render('shop/index.ejs', {
            pageTitle: 'Shop',
            path: '/',
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

exports.getProduct = (req, res, next) => {
    const id = req.params.productId
    Product.findById(id, product => {
        res.render("shop/product-detail", {
            product: product,
            pageTitle: product.title,
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
    Cart.getCartItems(cart => {
        Product.fetchAll(products => {
            const cartProducts = []
            for (let product of products){
                const cartprod = cart.products.find(prod => prod.id === product.id)
                // console.log(product)
                if(cartprod)
                    cartProducts.push({
                        productData: product,
                        qty: cartprod.qty
                    })
            }
            // console.log(cartProducts)
            res.render('shop/cart.ejs', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts 
            })
        })
    })

}

exports.postCart = (req, res, next) => {
    const ID = req.body.productId
    Product.findById(ID, prod => {
        Cart.addProduct(ID, prod.price)
    })
    res.redirect('/cart')
}

exports.deleteCartItem = (req, res, next) => {
    const id = req.body.productId
    Product.findById(id, prod => {
        Cart.deleteProduct(id, prod.price)
        res.redirect('/cart')
    })
}

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout.ejs', {
        pageTitle: 'Checkout',
        path: '/checkout',

    })
}