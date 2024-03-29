'use strict'

const express = require('express')
const DiscountController = require("../../controllers/discount.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const {authenticationv2} = require("../../auth/authUtils")


router.get('/list_product_code', asyncHandler(DiscountController.getAllProductsByDiscountCode))
router.get('/list_discount_code', asyncHandler(DiscountController.getAllDiscountCodesByShop))

router.use(authenticationv2)

router.post("/amount", asyncHandler(DiscountController.getDiscountAmount))
router.post('', asyncHandler(DiscountController.createDiscountCode))


module.exports = router

