'use strict'

const checkoutService = require("../services/checkout.service")
const {OK} = require("../core/succes.response")

class CartController {
    checkoutReview = async (req, res, next) => {
        new OK({
            message: "Checkout Order Successfully",
            metadata: await checkoutService.checkoutReview(req.body)
        }).send(res)
    }
}

module.exports = new CartController()