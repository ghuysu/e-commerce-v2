"use strict"

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const KeyTokenService = require("../services/keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")

//001: writer
//002: editor
//003: admin
const RoleShop = {
    SHOP: "shop",
    WRITER: "001",
    EDITOR: "002",
    ADMIN: "003"
}

class AccessService{
    static signUp = async ({name, email, password}) => {
        try{
            //check email exist
            const shop = await shopModel.findOne({email: email}).lean();
            if(shop){
                return {
                    code: "xxx",
                    message: "Shop already exists"
                }
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

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey: publicKey
                })

                if(!publicKeyString){
                    return {
                        code: "xxx",
                        message: "publicKeyString error"
                    }
                }
                console.log("publicKeyString::", publicKeyString)
                
                const publicKeyObject = crypto.createPublicKey(publicKeyString)
                console.log(publicKeyObject)

                //created token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyObject, privateKey)
                console.log("Created Token Successfully::", tokens)
                console.log(await getInfoData({fields: ['_id', 'name', 'email'], object: newShop}))
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }

        } catch(error){
            console.error(error)
            return {
                code: 200,
                metadata: null
            }
        }
    }
}

module.exports = AccessService