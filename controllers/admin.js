
const Product = require('../models/product')
const { validationResult } = require('express-validator')
const path = require('path')
const fileHelper = require('../utils/fileHelper')

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
    const img = req.file
    const desc = req.body.description
    const price = req.body.price
    const errors = validationResult(req)
    if (!img) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: { title: title, price: price, description: desc },
            errorMessage: 'Attached file is not an image',
            validationErrors: []
        })
    }
    const imageUrl = img.path
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: { title: title, price: price, description: desc },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    const prod = new Product({ title: title, price: price, description: desc, imageUrl: imageUrl, userId: req.user })
    prod
        .save()
        .then(result => {
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
            res.redirect('/500')
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
    const image = req.file
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: { title: title, price: price, description: desc, _id: prodId },
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
        if (image) {
            fileHelper.deleteFile(product.imageUrl)
            product.imageUrl = image.path
        }
        return product
            .save()
            .then(resu => {
                res.redirect('/admin/products')

            })
    })
        .catch(err => console.log(err))
    //We redirect before the update is done, so we'll not see the change immediately. So, put tha below line upwards
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId).then(product => {
        if (!product)
            return next(new Error('Product not found !!'))

        fileHelper.deleteFile(product.imageUrl)
        return Product.deleteOne({ _id: prodId, userId: req.user._id })
    }).then(result => {
            res.redirect('/admin/products')
    }).catch(err =>  {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.getProducts = (req, res, next) => {
    Product
        .find({ userId: req.user._id })
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            })
        })
        .catch(err => console.log(err))
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId).then(product => {
        if (!product)
            return next(new Error('Product not found !!'))

        fileHelper.deleteFile(product.imageUrl)
        return Product.deleteOne({ _id: prodId, userId: req.user._id })
    }).then(result => {
            res.status(200).json({
                message: "Success !!"
            })
    }).catch(err =>  {
        res.status(500).json({
            message: "Deleting product failed!!"
        })
    })
}
