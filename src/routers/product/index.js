"use strict"

const express = require("express")
const productController = require("../../controllers/product.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const { authenticationv2 } = require("../../auth/authUtils")


router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))

router.get('', asyncHandler(productController.findAllProducts))

router.get('/:product_id', asyncHandler(productController.findProduct))

//authentication
router.use(authenticationv2)

router.post('/', asyncHandler(productController.createProduct))

router.patch('/:product_id', asyncHandler(productController.updateProduct))
 
router.post('/publish/:id', asyncHandler(productController.publishProductByShop))

router.post('/unpublish/:id', asyncHandler(productController.unpublishProductByShop))

router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop))

router.get('/publish/all', asyncHandler(productController.getAllPublishForShop))

module.exports = router  