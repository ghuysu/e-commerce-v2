"use strict"

const keyTokenModel = require("../models/keytoken.model")
class KeyTokenService{

    static createKeyToken = async ({userId, publicKey, refreshToken}) => {
        try{
            const filter = {user: userId}, update = {
                publicKey, refreshTokensUsed: [], refreshToken
            }, options = {upsert: true, new: true}

            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch(error){
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({user: userId}).lean()
    }

    static deleteKeyById = async (id) => {
        return await keyTokenModel.deleteOne({_id: id})
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({refreshTokensUsed: refreshToken}).lean()
    }

    static deleteKeyByUserId = async (userId) => {
        return await keyTokenModel.deleteMany({user: userId})
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({refreshToken: refreshToken}).lean()
    }

    static findAndUpdateByRefreshToken = async (refreshToken, tokens) => {
        return await keyTokenModel.findOneAndUpdate({refreshToken: refreshToken}, {
                $set: {
                    refreshToken: tokens.refreshToken
                },
                $addToSet: {
                    refreshTokensUsed: refreshToken
                }
        })
    }
}

module.exports = KeyTokenService