
const Product = require('../models/product')

//View files are seen relative to views folders
exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        formCSS: true,
        productCSS: true,
        activeAddProduct: true
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const img = req.body.imageUrl
    const desc = req.body.description
    const price = req.body.price
    const prod = new Product(title, img, desc, price)
    prod.save()
    res.redirect('/')
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products.ejs', {
            products: products,
            pageTitle: 'Admin Products',
            path:'/admin/products'
        })
    })
}