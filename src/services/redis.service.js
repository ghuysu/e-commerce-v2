'use strict'

const redis = require('redis')
const redisClient = redis.createClient()
const {promisify} = require("util")
const {reservationInventory} = require("../models/repositories/inventory.repo")

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient)


const acquireLock = async(productId, quantity, cartId) => {
    const key = `lock_v2024_${productId}`
    const retryTimes = 10
    const expireTime = 3000

    for(let i = 0; i < retryTimes; i++){
        const result = await setnxAsync(key)
        console.log(`result::`, result)
        
        if(result === 1){
            const isRevervation = await reservationInventory({
                productId, quantity, cartId
            })
            if(isRevervation.modifiedCount){
                await pexpire(key, expireTime)
                return key
            }
            return null
        }
        else{
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async (keyLock)=> {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return delAsyncKey
}

module.exports = {
    acquireLock,
    releaseLock
}