const express = require('express')
const path = require('path')
const router = express.Router()
const rootDir = require('../utils/path')
const adminController = require('../controllers/admin.js')

// router.get('/add-product', (req, res, next) => {
//     console.log("In add-product middleware")
//     //Rel paths are not allowed
//     //Path should be rel to the loc of file
//     res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
// })
router.get('/add-product', adminController.getAddProduct)

router.get('/products', adminController.getProducts)

// Implicitly reached by /admin/add-product
router.post("/add-product", adminController.postAddProduct)

router.get('/edit-product/:productId', adminController.getEditProduct)

router.post('/edit-product', adminController.postEditProduct)

router.post('/delete-product', adminController.postDeleteProduct)


module.exports = router