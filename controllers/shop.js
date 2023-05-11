const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const stripe = require('stripe')(`${process.env.STRIPE}`)
const ITEMS_PER_PAGE = 1

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItems;
    Product
        .find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        }).then((rows) => {
            res.render('shop/index.ejs', {
                pageTitle: 'Shop',
                path: '/',
                products: rows,
                currentPage: page,
                hasNextPage: (totalItems > (page * ITEMS_PER_PAGE)),
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItems;
    Product
        .find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        }).then((rows) => {
            res.render('shop/product-list', {
                products: rows,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: (totalItems > (page * ITEMS_PER_PAGE)),
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            })
        })
        .catch(err => { console.log(err) })
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId
    Product.findById(id).then(product => {
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
    let cartProducts
    let totalPrice = 0
    req.user
        .populate('cart.items.productId')
        .then(user => {
            cartProducts = user.cart.items
            cartProducts.forEach(p => totalPrice += p.quantity * p.productId.price)
            let line_items = []
            cartProducts.forEach(p => {
                const prod = {
                    currency: 'usd',
                    product_data: {
                        name: p.productId.title
                    },
                    unit_amount: p.productId.price*100
                }
                line_items.push({
                    price_data: prod,
                    quantity: p.quantity
                })
            })
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: line_items,
                mode: 'payment',
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'

            })
        }).then(session => {
            res.render('shop/checkout.ejs', {
                pageTitle: 'Checkout',
                path: '/checkout',
                products: cartProducts,
                totalPrice: totalPrice,
                sessionId: session.id
            }) 
        })
        .catch(err => console.log(err))
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId
    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('No order found !!'))
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorised'))
        }
        const invoiceName = 'Invoice-' + orderId + '.pdf'
        const invoicePath = path.join('data', 'invoices', invoiceName)
        /** Reading the data
        fs.readFile(invoicePath, (err, data) => {
            if (err) {
                return next(err)
            }
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
            res.send(data)
        })
         */
        /* Streaming the data
        const readStream = fs.createReadStream(invoicePath)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
        readStream.pipe(res)
        */
        //Generate PDF on the fly
        const pdfDoc = new PDFDocument()
        pdfDoc.pipe(fs.createWriteStream(invoicePath))
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
        pdfDoc.pipe(res)
        // pdfDoc.text('Hello world')
        pdfDoc.fontSize(26).text('Invoice', { underline: true })
        pdfDoc.text('---------------------------------------------------')
        let totalPrice = 0
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price
            pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price)
        })
        pdfDoc.text('---------------------------------------------------')
        pdfDoc.fontSize(20).text('Total price : ' + '$' + totalPrice)
        pdfDoc.end()

    }).catch(err => next(err))
}