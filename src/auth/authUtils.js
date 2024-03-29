'use strict'

const JWT = require("jsonwebtoken")
const { asyncHandler } = require("../helpers/asyncHandler")
const { AuthFailureError, NotFoundError } = require("../core/error.response")
const { findByUserId } = require("../services/keyToken.service")
const crypto = require('crypto')
const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
    CLIENT_ID: 'x-client-id',
    REFRESH_TOKEN: 'x-refresh-token'
}

//01: Invalid request (missing header userId)
//02: Not Found key store
//03: Invalid request (missing header accessToken)
//04: Invalid request(wrong userId in decode)
//05: Invalid userId

const createTokenPair = async (payload, publicKey, privateKey) => {
    try{
        console.log({privateKey, publicKey})
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
        console.error(error)
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1. check userid missing
        2. get accessToken
        3. verify token
        4. check user in db
        5. check keyStore with this userid
        6. ok all => return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId){
        throw new AuthFailureError("Invalid request (missing header userId)")
    }

    const keyStore = await findByUserId(userId);
    if(!keyStore){
        throw new NotFoundError("Not Found key store")
    }
    
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken){
        throw new AuthFailureError("Invalid request (missing header accessToken)")
    }

    try{
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        
        if(userId !== decodeUser.userId){
            throw new AuthFailureError("Invalid request(wrong userId in decode)")
        }
        req.user = decodeUser
        
        return next()
    } catch(error){
        throw error
    }
})

const authenticationv2 = asyncHandler(async (req, res, next) => {
    /*
        1. check userid missing
        2. get accessToken
        3. if have valid refreshToken -> next
        4. verify token
        5. check user in db
        6. check keyStore with this userid
        7. ok all => return next()
    */

    //1
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId){
        throw new AuthFailureError("Invalid request (missing header userId)")
    }

    //2
    const keyStore = await findByUserId(userId);
    if(!keyStore){
        throw new NotFoundError("02")
    }
    
    //3
    if(req.headers[HEADER.REFRESH_TOKEN]){
        try{
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.publicKey)
            if(userId !== decodeUser.userId) throw new AuthFailureError("05")
            req.keyStore = keyStore
            req.refreshToken = refreshToken
            req.user = decodeUser
            console.log({keyStore: req.keyStore, rt: req.refreshToken, user: req.user})
            return next()
        } catch(error){
            throw error
        }
    }


    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken){
        throw new AuthFailureError("03")
    }

    try{
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId){
            throw new AuthFailureError("04")
        }
        req.keyStore = keyStore
        req.user = decodeUser
        
        return next()
    } catch(error){
        throw error
    }
})

const verifyJWT = async (token, keySecret) =>{
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationv2,
    verifyJWT
}