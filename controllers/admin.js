
const Product = require('../models/product')

//View files are seen relative to views folders
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const img = req.body.imageUrl
    const desc = req.body.description
    const price = req.body.price
    const prod = new Product(null, title, img, desc, price)
    prod
    .save()
    .then(() => {
        res.redirect('/')
    })
    .catch(err => console.log(err))
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if(!editMode){
        res.redirect('/')
    }
    const productId = req.params.productId
    const product = Product.findById(productId, product => {
        if (!product) {
            return res.redirect('/')
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            product: product,
            editing: editMode
        })
    })    
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.id
    const title = req.body.title
    const price = req.body.price
    const desc = req.body.description
    const imageUrl = req.body.imageUrl
    const pupdatedProd = new Product(prodId, title, imageUrl, desc, price)
    pupdatedProd.save()
    res.redirect('/admin/products')
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.deleteById(prodId)
    res.redirect('/admin/products')
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
