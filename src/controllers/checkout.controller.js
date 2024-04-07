'use strict'

const checkoutService = require("../services/checkout.service")
const {OK, CREATED} = require("../core/succes.response")

class CartController {
    checkoutReview = async (req, res, next) => {
        new OK({
            message: "Checkout Order Successfully",
            metadata: await checkoutService.checkoutReview(
                {
                    ...req.body,
                    userId: req.user.userId
                })
        }).send(res)
    }

    orderByUser = async (req, res, next) => {
        new CREATED({
            message: "CREATE ORDER SUCCESSFULLY",
            meta: await checkoutService.orderByUser({
                ...req.body,
                userId: req.user.userId,
                user_address: req.user.location
            })
        }).send(res)
    }
}

module.exports = new CartController()