
const Product = require('../models/product')

//View files are seen relative to views folder
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const img = req.body.imageUrl
    const desc = req.body.description
    const price = req.body.price
    const prod = new Product({title: title, price: price, description: desc, imageUrl: img, userId: req.user})
    prod
        .save()
        .then(result => {
            console.log('Product created')
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err))

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
                isAuthenticated: req.session.isLoggedIn
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

    Product.findById(prodId).then(product => {
        product.title = title
        product.price = price
        product.description = desc
        product.imageUrl = imageUrl
        return product.save()
    })
        .then(resu => {
            console.log('Product updated !!')
            res.redirect('/admin/products')

        })
        .catch(err => console.log(err))
    //We redirect before the update is done, so we'll not see the change immediately. So, put tha below line upwards
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.findByIdAndRemove(prodId)
        .then(result => {
            console.log('Destroyed')
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
    Product
        .find()
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            console.log(products)
            res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
                isAuthenticated: req.session.session.isLoggedIn
            })
        })
        .catch(err => console.log(err))
}
