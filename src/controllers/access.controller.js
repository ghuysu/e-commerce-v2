"use strict"

const AccessService = require("../services/access.service")
const {OK, CREATED} = require("../core/succes.response")

const HEADER = {
    privateKey: "x-private-key"
}

class AccessController{

    handleRefreshToken = async (req, res, next) => {
        // new OK({
        //     message:"Get Token successfully",
        //     metadata: await AccessService.handlRefreshToken(req.body)
        // }).send(res)

        //v2: fixed, no need accesstoken
        new OK({
            message:"Get Token successfully",
            metadata: await AccessService.handlRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
                privateKey: req.headers[HEADER.privateKey]
            })
        }).send(res)
    }

    logout = async (req, res, next) => {
        new OK({
            message: "Logged Out Successfully",
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    login = async (req,res, next) => {
        new OK({
            message: "Logged In Successfully",
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registerd Successfully",
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }
}

module.exports = new AccessController()