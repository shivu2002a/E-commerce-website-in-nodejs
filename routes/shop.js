const express = require('express')
const path = require('path')
const shopController = require('../controllers/shop.js')
const router = express.Router()
const isAuth = require('../middleware/is-auth')

// router.get('/', (req, res, next) => {
//     console.log("In add-product middleware")
//     console.log(adminData.products)
//     res.sendFile(path.join(__dirname,'../', 'views', 'shop.html'))
// }) 

router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)

router.get('/products/:productId', shopController.getProduct)

router.post('/create-order',isAuth, shopController.postOrder)

router.get('/orders',isAuth, shopController.getOrders)

router.post('/cart',isAuth, shopController.postCart)

router.get('/cart', isAuth, shopController.getCart)

router.post('/delete-cart-item',isAuth, shopController.deleteCartItem)

// router.get('/checkout', shopController.getCheckout)

module.exports = router