'use strict'

const CartService= require("../services/cart.service")
const {OK, CREATED} = require("../core/succes.response")

class CartController {
    addToCart = async (req, res, next) => {
        new OK({
            message: "Add Product To Cart Successfully",
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    updateCart = async (req, res, next) => {
        new OK({
            message: "Update Quantity Product Successfully",
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    getListCart = async (req, res, next) => {
        new OK({
            message: "Get Products In Cart Successfully",
            metadata: await CartService.getListUserCart(req.body)
        }).send(res)
    }
}

module.exports = new CartController()