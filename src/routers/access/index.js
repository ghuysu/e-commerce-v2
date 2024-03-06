"use strict"

const express = require("express")
const accessController = require("../../controllers/access.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const { authenticationv2 } = require("../../auth/authUtils")

//sign up
router.post("/shop/signup", asyncHandler(accessController.signUp))
//login
router.post("/shop/login", asyncHandler(accessController.login))

//authentication
router.use(authenticationv2)

//logout
router.post("/shop/logout", asyncHandler(accessController.logout))
//handle refresh token
router.post("/shop/handleRefreshToken", asyncHandler(accessController.handleRefreshToken))


module.exports = router  