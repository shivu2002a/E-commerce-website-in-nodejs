const express = require('express')
const path = require('path')
const router = express.Router()
const rootDir = require('../utils/path')
const adminController = require('../controllers/admin.js')
const isAuth = require('../middleware/is-auth')
const { body, query} = require('express-validator')

// router.get('/add-product', (req, res, next) => {
//     console.log("In add-product middleware")
//     //Rel paths are not allowed
//     //Path should be rel to the loc of file
//     res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
// })
// Implicitly reached by /admin/add-product
router.get('/products', isAuth, adminController.getProducts)

router.get('/add-product', isAuth, adminController.getAddProduct)
router.post("/add-product",
    [isAuth,
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),

        body('price').isFloat({gt: 0}),

        // body('imageUrl').isURL(),

        body('description').trim().isLength({ min: 5, max: 400 })
    ],
    adminController.postAddProduct)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)
router.post('/edit-product', [isAuth,
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),

    body('price').isFloat({gt: 0}),

    // body('imageUrl').isURL(),

    body('description').trim().isLength({ min: 5, max: 400 })
], adminController.postEditProduct)

// router.post('/delete-product', isAuth, adminController.postDeleteProduct)

router.delete('/delete-product/:productId', isAuth, adminController.deleteProduct)


module.exports = router