'use strict'

const express = require('express')
const CartController = require("../../controllers/cart.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const {authenticationv2} = require("../../auth/authUtils")

router.use(authenticationv2)

router.post('', asyncHandler(CartController.addToCart))
router.post('/update', asyncHandler(CartController.updateCart))
router.get('', asyncHandler(CartController.getListCart))

module.exports = router

