"use strict"

const express = require("express")
const accessController = require("../../controllers/access.controller")
const router = express.Router()
const {asyncHandler} = require("../../helpers/asyncHandler")
const { authenticationv2 } = require("../../auth/authUtils")

//handle refresh token
router.post("/handleRefreshToken", asyncHandler(accessController.handleRefreshToken))

//sign up
router.post("/signup", asyncHandler(accessController.signUp))
//login
router.post("/login", asyncHandler(accessController.login))

//authentication
router.use(authenticationv2)

//logout
router.post("/logout", asyncHandler(accessController.logout))


module.exports = router  