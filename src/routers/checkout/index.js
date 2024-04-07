'use strict'

const express = require('express')
const CheckoutController = require("../../controllers/checkout.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const {authenticationv2} = require("../../auth/authUtils")

router.use(authenticationv2)

router.post('/review', asyncHandler(CheckoutController.checkoutReview))
router.post('/order', asyncHandler(CheckoutController.orderByUser))

module.exports = router

