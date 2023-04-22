const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        requires: true
    },
    password: {
        type: String,
        requires: true
    },
    resetToken: String,
    resetTokenExpiration: Date, 
    cart: {
        items: [{ 
            productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' }, 
            quantity: { type: Number, required: true } 
        }]
    }
})

userSchema.methods.addToCart = function (product) {
    let cartProductIndex
    let updatedCartItems = []
    if (this.cart) {
        cartProductIndex = this.cart.items.findIndex(cp => { return cp.productId.toString() === product._id.toString() })
        updatedCartItems = [...this.cart.items]
    }
    let newQuantity = 1;
    if (cartProductIndex >= 0) {
        newQuantity += this.cart.items[cartProductIndex].quantity
        updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.deleteItemFromCart = function (productId) {
    let updatedCarItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    })
    this.cart.items = updatedCarItems
    return this.save()
}

userSchema.methods.clearCart = function(){
    this.cart = {items: []}
    return this.save()
}

module.exports = mongoose.model('User', userSchema)