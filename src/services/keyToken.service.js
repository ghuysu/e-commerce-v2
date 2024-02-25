"use strict"

const keyTokenModel = require("../models/keytoken.model")

class KeyTokenService{

    static createKeyToken = async ({userId, publicKey}) => {
        try{
            const publicKeyString = publicKey.toString()
            
            const token = await keyTokenModel.create({
                user: userId,
                publicKey: publicKeyString
            })

            return token ? token.publicKey : null
        } catch(error){
            return error
        }
    }
}

module.exports = KeyTokenService