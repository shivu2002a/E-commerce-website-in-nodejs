
const Product = require('../models/product')
const { validationResult } = require('express-validator')

//View files are seen relative to views folder
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const img = req.body.imageUrl
    const desc = req.body.description
    const price = req.body.price
    const prod = new Product({ title: title, price: price, description: desc, imageUrl: img, userId: req.user })
    const errors = validationResult(req)
    console.log(req.user)
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: { title: title, price: price, description: desc, imageUrl: img, userId: req.user },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    prod
        .save()
        .then(result => {
            console.log('Product created')
            res.redirect('/admin/products')
        })
        .catch(err =>  {
            console.log(err)
            // res.redirect('/500')
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })

}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if (!editMode) {
        res.redirect('/')
    }
    const productId = req.params.productId
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/')
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                product: product,
                editing: editMode,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            })
        })
        .catch(err => console.log(err))
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.id
    const title = req.body.title
    const price = req.body.price
    const desc = req.body.description
    const imageUrl = req.body.imageUrl
    const errors = validationResult(req)
    // console.log(req.user)

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: { title: title, price: price, description: desc, imageUrl: imageUrl, _id: prodId },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    Product.findById(prodId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/')
        }
        product.title = title
        product.price = price
        product.description = desc
        product.imageUrl = imageUrl
        return product
            .save()
            .then(resu => {
                // console.log('Product updated !!')
                res.redirect('/admin/products')

            })
    })
        .catch(err => console.log(err))
    //We redirect before the update is done, so we'll not see the change immediately. So, put tha below line upwards
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            console.log('Destroyed')
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
    Product
        .find({ userId: req.user._id })
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            // console.log(products)
            res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            })
        })
        .catch(err => console.log(err))
}
