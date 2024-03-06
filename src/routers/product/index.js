"use strict"

const express = require("express")
const productController = require("../../controllers/product.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const { authenticationv2 } = require("../../auth/authUtils")
const { product } = require("../../models/product.model")


router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))
//authentication
router.use(authenticationv2)

router.post('/', asyncHandler(productController.createProduct))

router.post('/publish/:id', asyncHandler(productController.publishProductByShop))

router.post('/unpublish/:id', asyncHandler(productController.unpublishProductByShop))

router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop))

router.get('/publish/all', asyncHandler(productController.getAllPublishForShop))

module.exports = router  