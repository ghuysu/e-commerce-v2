'use strict'

const InventoryService = require("../services/inventory.service")
const {OK, CREATED} = require("../core/succes.response")

class InventoryController{
    addStockInventory = async (req, res, next) => {
        new OK({
            message: 'Add Stock To Inventory Successfully',
            metadata: await InventoryService.addStockToInventory({
                ...req.body,
                inven_shopId: req.user.userId          
            })
        }).send(res)
    }
}

module.exports = new InventoryController()