"use strict"

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const KeyTokenService = require("../services/keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const {findByEmail} = require("../services/shop.service")
const keytokenModel = require("../models/keytoken.model")
//001: writer
//002: editor
//003: admin
const RoleShop = {
    SHOP: "shop",
    WRITER: "001",
    EDITOR: "002",
    ADMIN: "003"
}

//01: Shop was not registered
//02: Incorrect password
//03: Internal server error
//04: Shop already registered
//05: Something wrong - relogin
class AccessService{

    static handlRefreshTokenV2 = async ({refreshToken, user, keyStore, privateKey}) => {
        /* 
            1. check whether refresh token is used or not
            2. if it does -> decode to get infor -> delete key
            3. if it doesn't -> check wheter refresh token is currently used
            4. verify token to get infor
            5. check shop is exist
            6. create tokens
            7. update refresh token
            8. return data
        */
        const {userId, email} = user;

        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyByUserId(userId)
            throw new ForbiddenError('05')
        }

        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError("01")

        const foundShop = await findByEmail({email})
        if(!foundShop){
            throw new AuthFailureError('01')
        }

        //create 1 pair token
        const publicKeyObject = crypto.createPublicKey(keyStore.publicKey)
        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKeyObject, privateKey)

        //update token
        await KeyTokenService.findAndUpdateByRefreshToken(refreshToken, tokens)

        return {
            user,
            tokens
        }
    }

    static handlRefreshToken = async ({refreshToken, privateKey}) => {
        /* 
            1. check whether refresh token is used or not
            2. if it does -> decode to get infor -> delete key
            3. if it doesn't -> check wheter refresh token is currently used
            4. verify token to get infor
            5. check shop is exist
            6. create tokens
            7. update refresh token
            8. return data
        */
        //check whether refresh token used or not
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        
        if(foundToken){
            //decode to get infor
            const {userId, email} = await verifyJWT(refreshToken, foundToken.publicKey)
            console.log({userId, email})

            //delete key
            await KeyTokenService.deleteKeyByUserId(userId)
            throw new ForbiddenError('05')
        }

        const holdToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holdToken){
            throw new AuthFailureError('01')
        }

        //verifyToken
        const {userId, email} = await verifyJWT(refreshToken, holdToken.publicKey)
        console.log("[2] ", {userId, email})

        //checkShop
        const foundShop = await findByEmail({email})
        if(!foundShop){
            throw new AuthFailureError('01')
        }

        //create 1 pair token
        const publicKeyObject = crypto.createPublicKey(holdToken.publicKey)
        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKeyObject, privateKey)

        //update token
        await KeyTokenService.findAndUpdateByRefreshToken(refreshToken, tokens)

        return {
            user: {
                userId,
                email
            },
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.deleteKeyById(keyStore._id)
        console.log(delKey)

        return delKey
    }

    static login = async ({email, password}) => {
        /* 
            1. check email
            2. check password
            3. create public and private key
            4. convert publickey from string to object
            5. create access and refresh token
            6. save data into db
            7. return data
        */

        // check email in dbs
        console.log(email, password)
        const foundShop = await findByEmail({email})

        if(!foundShop){
            throw new BadRequestError("01")
        }

        //match password
        const match = bcrypt.compare(password, foundShop.password)

        if(!match)
        {
            throw new AuthFailureError("02")
        }

        //create accesstoken, refreshtoken - save
        const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        })

        console.log({privateKey, publicKey})
        
        //generate tokens
        const publicKeyObject = crypto.createPublicKey(publicKey)

        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKeyObject, privateKey)
        
        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            publicKey: publicKey,
            refreshToken: tokens.refreshToken
        })

        return {
            shop: getInfoData({fields: ["_id", 'name', 'email'], object: foundShop}),
            tokens,
            privateKey
        }
    }

    static signUp = async ({name, email, password}) => {
    /* 
        1. check email exist
        2. hash password
        3. create shop model
        4. if created successfully -> create public and private key
        5. convert publickey from string to object
        6. create access and refresh token
        7. save publickey into db
        8. return data
    */
        //check email exist
        const shop = await shopModel.findOne({email: email}).lean();
        if(shop){
            throw new BadRequestError('04')
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name: name,
            email: email, 
            password: hashedPassword, 
            roles: RoleShop.SHOP
        })

        if(newShop){
            //created privateKey, publicKey
            const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            })

            console.log({privateKey, publicKey})//save into collection keyStore
            
            const publicKeyObject = crypto.createPublicKey(publicKey)
            console.log(publicKeyObject)

            //created token pair
            const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyObject, privateKey)
            console.log("Created Token Successfully::", tokens)

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey: publicKey,
                refreshToken: tokens.refreshToken
            })

            if(!publicKeyString){
                throw new BadRequestError('03')
            }
            console.log("publicKeyString::", publicKeyString)
            
            console.log(await getInfoData({fields: ['_id', 'name', 'email'], object: newShop}))
            
            return {
                    shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}),
                    tokens,
                    privateKey
                }
        }
    }

}

module.exports = AccessService