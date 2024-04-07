'use strict'

const CartService= require("../services/cart.service")
const {OK, CREATED} = require("../core/succes.response")

class CartController {
    addToCart = async (req, res, next) => {
        new OK({
            message: "Add Product To Cart Successfully",
            metadata: await CartService.addToCart({
                product: req.body.product,
                userId: req.user.userId
            })
        }).send(res)
    }

    updateCart = async (req, res, next) => {
        new OK({
            message: "Update Quantity Product In Cart Successfully",
            metadata: await CartService.addToCartV2({
                ...req.body,
                userId: req.user.userId
            })
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