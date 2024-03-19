"use strict"

const express = require("express")
const { apiKey, permission } = require("../auth/checkAuth")
const { route } = require("./access")
const router = express.Router()

//check api key
router.use(apiKey)

//check permission
router.use(permission('0000'))

router.use("/v1/api/product", require("./product"))
router.use("/v1/api/shop", require("./access"))

module.exports = router