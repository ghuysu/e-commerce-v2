const { Mongoose, default: mongoose } = require("mongoose");
const { inventory } = require("../inventory.model");
const {BadRequestError, NotFoundError} = require("../../core/error.response")

const insertInventory = async({productId, shopId, stock, location}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_shopId: shopId,
        inven_location: location 
    })
}

const getInventoryByShopAndProductId = async({productId, shopId}) => {
    return await inventory.findOne({inven_productId: productId, inven_shopId: shopId}).lean()
}

const getInventoryByProductId = async({productId}) => {
    return await inventory.findOne({inven_productId: productId}).lean()
}

const reservationInventory = async ({productId, quantity, cartId}) => {
    const query = {
        inven_productId: new mongoose.Types.ObjectId(productId),
        inven_stock: {$gte: quantity}
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservations: {
                quantity,
                cartId,
                createOn: new Date()
            }
        }
    }, options = {upsert: false, new: true}

    return await inventory.updateOne(query, updateSet,options)
    // let foundinventory = await inventory.findOne({inven_productId: productId})
    // if(!foundinventory) throw new NotFoundError("not found Inventory")

    // if(foundinventory.stock < quantity) throw new BadRequestError("over stock")

    // foundinventory.inven_reservations.push({
    //                 quantity,
    //                  cartId,
    //                  createOn: new Date()
    //              })

    // foundinventory = await inventory.updateOne(foundinventory, {new: true})
    // return foundinventory
}

module.exports = {
    insertInventory,
    reservationInventory,
    getInventoryByShopAndProductId,
    getInventoryByProductId
}