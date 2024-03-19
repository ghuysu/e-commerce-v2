const { inventory } = require("../inventory.model");

const insertInventory = async({productId, shopId, stock, location}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_shopId: shopId,
        inven_location: location 
    })
}

module.exports = {
    insertInventory
}