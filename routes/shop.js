const express = require('express')
const path = require('path')
const shopController = require('../controllers/shop.js')
const router = express.Router()

// router.get('/', (req, res, next) => {
//     console.log("In add-product middleware")
//     console.log(adminData.products)
//     res.sendFile(path.join(__dirname,'../', 'views', 'shop.html'))
// })

//Pug engine
router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)

router.get('/products/:productId', shopController.getProduct)

router.get('/orders', shopController.getOrders)

router.post('/cart', shopController.postCart)

router.get('/cart', shopController.getCart)

router.post('/delete-cart-item', shopController.deleteCartItem)

router.get('/checkout', shopController.getCheckout)

module.exports = router