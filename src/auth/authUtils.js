'use strict'

const JWT = require("jsonwebtoken")

const createTokenPair = async (payload, publicKey, privateKey) => {
    try{
        console.log(privateKey, publicKey)
        //accessToken
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "2 days"
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "7 days"
        })

        JWT.verify(accessToken, publicKey, (error, decode) => {
            if(error){
                console.error("error vetify::", error)
            } else {
                console.log("decode verify", decode)
            }
        })

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    createTokenPair
}