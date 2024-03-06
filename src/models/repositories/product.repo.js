'use strict'

const {product, electronic, clothing} = require("../product.model")
const {ObjectId} = require("mongoose").Types

const queryProduct = async({query, limit, skip}) => {
    return await product.find(query)
        .populate('product_shop', 'name email _id')
        .sort({updatedAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const publishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new ObjectId(product_shop),
        _id: Object(product_id)
    })

    if(!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublished = true

    await foundShop.updateOne(foundShop)

    return foundShop
}

const unpublishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new ObjectId(product_shop),
        _id: Object(product_id)
    })

    if(!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPublished = false

    await foundShop.updateOne(foundShop)

    return foundShop
}

const searchProductByUser = async({keySearch}) =>{
    const regexSearch = new RegExp(keySearch)
    const result = await product.find(
        { isPublished: true, $text: { $search: regexSearch } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).lean()

    return result
}

module.exports = {
    queryProduct,
    publishProductByShop,
    unpublishProductByShop,
    searchProductByUser
}