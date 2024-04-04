'use strict'

const { default: mongoose } = require("mongoose")
const {cart} = require("../cart.model")

const findProductInCartByProductId = async (userId, productId) => {
    const userCart = await cart.findOne({cart_userId: userId}).lean()
    return userCart.cart_products.find(product => product.productId === productId)
}

const findCartByID = async (cartId) => {
    return await cart.findOne({_id: cartId, cart_state: 'active'}).lean()
}

module.exports = {
    findProductInCartByProductId,
    findCartByID
}