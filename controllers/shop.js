const Product = require('../models/product')
const Order = require('../models/order')

exports.getIndex = (req, res, next) => {
    Product.find().then((rows) => {
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
    Product.find().then(products => {
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
    Product.findById(id).then(product => {
        console.log(product)
        res.render('shop/product-detail.ejs', {
            product: product,
            pageTitle: product.title,
            path: '/product'
        })
    })
}

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } }
            })
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            })
            return order.save()
        })
        .then(result => {
            req.user.clearCart()
            res.redirect('/orders')
        })
        .catch(err => console.log(err))

}

exports.getOrders = (req, res, next) => {
    Order
        .find({ 'user.userId': req.user._id.toString() })
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
    req.user
        .populate('cart.items.productId')
        .then(user => {
            // console.log(user.cart.items)
            const cartProducts = user.cart.items
            res.render('shop/cart.ejs', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            })
        })
        .catch(err => console.log(err))

}

exports.postCart = (req, res, next) => {
    const prodID = req.body.productId
    Product
        .findById(prodID)
        .then(prod => {
            return req.user.addToCart(prod)
        })
        .then(result => {
            // console.log(result)
            res.redirect('/cart')
        })
        .catch(err => console.log(err))
}

exports.deleteCartItem = (req, res, next) => {
    const prodId = req.body.productId
    req
        .user
        .deleteItemFromCart(prodId)
        .then(result => {
            return res.redirect('/cart')
        })
        .catch(err => console.log(err))
}

exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout.ejs', {
        pageTitle: 'Checkout',
        path: '/checkout'
    })
}