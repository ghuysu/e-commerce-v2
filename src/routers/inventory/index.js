'use strict'

const express = require('express')
const InventoryController = require("../../controllers/inventory.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const {authenticationv2} = require("../../auth/authUtils")

router.use(authenticationv2)

router.post('', asyncHandler(InventoryController.addStockInventory))

module.exports = router

